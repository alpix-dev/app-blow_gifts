const axios = require('axios')
const getAppData = require('../../lib/store-api/get-app-data')

const ecomUtils = require('@ecomplus/utils')
const {
  validateDateRange,
  validateCustomerId,
  checkOpenPromotion,
  getValidDiscountRules,
  matchDiscountRule,
  checkCampaignProducts
} = require('../../lib/helpers')

exports.post = ({ appSdk, admin }, req, res) => {  
  const { storeId } = req
    // body was already pre-validated on @/bin/web.js
    // treat module request body
    const { params, application } = req.body
    // app configured options

    getAppData({ appSdk, storeId }).then(config => {
      // setup response object
      // https://apx-mods.e-com.plus/api/v1/apply_discount/response_schema.json?store_id=100
      const response = {}
      
      const addDiscount = (discount, flag, label) => {
        let value
        const maxDiscount = params.amount[discount.apply_at || 'total']
        if (maxDiscount) {
          // update amount discount and total
          if (discount.type === 'percentage') {
            value = maxDiscount * discount.value / 100
          } else {
            value = discount.value
          }
          if (value > maxDiscount) {
            value = maxDiscount
          }
        }

        if (value) {
          if (response.discount_rule) {
            // accumulate discount
            const extraDiscount = response.discount_rule.extra_discount
            extraDiscount.value += value
            if (extraDiscount.flags.length < 20) {
              extraDiscount.flags.push(flag)
            }
          } else {
            response.discount_rule = {
              label: label || flag,
              extra_discount: {
                value,
                flags: [flag]
              }
            }
          }
          return true
        }
        return false
      }

      if (params.items && params.items.length) {
        // gift products (freebies) campaings
        if (Array.isArray(config.freebies_rules)) {
          const validFreebiesRules = config.freebies_rules.filter(rule => {
            return validateDateRange(rule) &&
              validateCustomerId(rule, params) &&
              checkCampaignProducts(rule.check_product_ids, params) &&
              Array.isArray(rule.product_ids) &&
              rule.product_ids.length
          })
          if (validFreebiesRules) {
            console.log('validFreebies 1')
            console.log(JSON.stringify(params.items))
            let subtotal = 0
            params.items.forEach(item => {
              subtotal += (item.quantity * ecomUtils.price(item))
            })

            let bestRule
            let discountValue = 0
            for (let i = 0; i < validFreebiesRules.length; i++) {
              const rule = validFreebiesRules[i]
              // start calculating discount
              let value = 0
              rule.product_ids.forEach(productId => {
                const item = params.items.find(item => productId === item.product_id)
                if (item) {
                  value += ecomUtils.price(item)
                }
              })
              const fixedSubtotal = subtotal - value
              if (
                !(rule.min_subtotal > fixedSubtotal) &&
                (!bestRule || value > discountValue || bestRule.min_subtotal < rule.min_subtotal)
              ) {
                bestRule = rule
                discountValue = value
              }
            }

            if (bestRule) {
              // provide freebie products \o/
              response.freebie_product_ids = bestRule.product_ids
              if (discountValue) {
                addDiscount(
                  {
                    type: 'fixed',
                    value: discountValue
                  },
                  'FREEBIES',
                  bestRule.label
                )
              }
            }
          }
        }
      }
      res.send(response)
    })
    .catch(err => {
      console.error(err)
      res.send(err.message)
    })    
}
