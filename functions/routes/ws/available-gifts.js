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
      const respondSuccess = () => {
        if (response.available_extra_discount && !response.available_extra_discount.value) {
          delete response.available_extra_discount
        }
        if (
          response.discount_rule &&
          (!response.discount_rule.extra_discount || !response.discount_rule.extra_discount.value)
        ) {
          delete response.discount_rule
        }
        res.send(response)
      }
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
        // try product kit discounts first
        if (Array.isArray(config.product_kit_discounts)) {
          config.product_kit_discounts = config.product_kit_discounts.map(kitDiscount => {
            if (!kitDiscount.product_ids) {
              // kit with any items
              kitDiscount.product_ids = []
            }
            return kitDiscount
          })
        }
        const kitDiscounts = getValidDiscountRules(config.product_kit_discounts, params, params.items)
          .sort((a, b) => {
            if (a.min_quantity > b.min_quantity) {
              return -1
            } else if (b.min_quantity > a.min_quantity) {
              return 1
            } else if (a.discount.min_amount > b.discount.min_amount) {
              return -1
            } else if (b.discount.min_amount > a.discount.min_amount) {
              return 1
            }
            return 0
          })
        
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
