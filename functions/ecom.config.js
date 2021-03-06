/* eslint-disable comma-dangle, no-multi-spaces, key-spacing */

/**
 * Edit base E-Com Plus Application object here.
 * Ref.: https://developers.e-com.plus/docs/api/#/store/applications/
 */

const app = {
  app_id: 120452,
  title: 'BlowGummies - Brindes',
  slug: 'bg-gifts',
  type: 'external',
  state: 'active',
  authentication: true,

  /**
   * Uncomment modules above to work with E-Com Plus Mods API on Storefront.
   * Ref.: https://developers.e-com.plus/modules-api/
   */
  modules: {
    /**
     * Triggered to calculate shipping options, must return values and deadlines.
     * Start editing `routes/ecom/modules/calculate-shipping.js`
     */
    // calculate_shipping:   { enabled: true },

    /**
     * Triggered to validate and apply discount value, must return discount and conditions.
     * Start editing `routes/ecom/modules/apply-discount.js`
     */
    apply_discount:       { enabled: true },

    /**
     * Triggered when listing payments, must return available payment methods.
     * Start editing `routes/ecom/modules/list-payments.js`
     */
    // list_payments:        { enabled: true },

    /**
     * Triggered when order is being closed, must create payment transaction and return info.
     * Start editing `routes/ecom/modules/create-transaction.js`
     */
    // create_transaction:   { enabled: true },
  },

  /**
   * Uncomment only the resources/methods your app may need to consume through Store API.
   */
  auth_scope: {
    'stores/me': [
      'GET'            // Read store info
    ],
    procedures: [
      'POST'           // Create procedures to receive webhooks
    ],
    products: [
      // 'GET',           // Read products with public and private fields
      // 'POST',          // Create products
      // 'PATCH',         // Edit products
      // 'PUT',           // Overwrite products
      // 'DELETE',        // Delete products
    ],
    brands: [
      // 'GET',           // List/read brands with public and private fields
      // 'POST',          // Create brands
      // 'PATCH',         // Edit brands
      // 'PUT',           // Overwrite brands
      // 'DELETE',        // Delete brands
    ],
    categories: [
      // 'GET',           // List/read categories with public and private fields
      // 'POST',          // Create categories
      // 'PATCH',         // Edit categories
      // 'PUT',           // Overwrite categories
      // 'DELETE',        // Delete categories
    ],
    customers: [
      // 'GET',           // List/read customers
      // 'POST',          // Create customers
      // 'PATCH',         // Edit customers
      // 'PUT',           // Overwrite customers
      // 'DELETE',        // Delete customers
    ],
    orders: [
      // 'GET',           // List/read orders with public and private fields
      // 'POST',          // Create orders
      // 'PATCH',         // Edit orders
      // 'PUT',           // Overwrite orders
      // 'DELETE',        // Delete orders
    ],
    carts: [
      // 'GET',           // List all carts (no auth needed to read specific cart only)
      // 'POST',          // Create carts
      // 'PATCH',         // Edit carts
      // 'PUT',           // Overwrite carts
      // 'DELETE',        // Delete carts
    ],

    /**
     * Prefer using 'fulfillments' and 'payment_history' subresources to manipulate update order status.
     */
    'orders/fulfillments': [
      // 'GET',           // List/read order fulfillment and tracking events
      // 'POST',          // Create fulfillment event with new status
      // 'DELETE',        // Delete fulfillment event
    ],
    'orders/payments_history': [
      // 'GET',           // List/read order payments history events
      // 'POST',          // Create payments history entry with new status
      // 'DELETE',        // Delete payments history entry
    ],

    /**
     * Set above 'quantity' and 'price' subresources if you don't need access for full product document.
     * Stock and price management only.
     */
    'products/quantity': [
      // 'GET',           // Read product available quantity
      // 'PUT',           // Set product stock quantity
    ],
    'products/variations/quantity': [
      // 'GET',           // Read variaton available quantity
      // 'PUT',           // Set variation stock quantity
    ],
    'products/price': [
      // 'GET',           // Read product current sale price
      // 'PUT',           // Set product sale price
    ],
    'products/variations/price': [
      // 'GET',           // Read variation current sale price
      // 'PUT',           // Set variation sale price
    ],

    /**
     * You can also set any other valid resource/subresource combination.
     * Ref.: https://developers.e-com.plus/docs/api/#/store/
     */
  },

  admin_settings: {
    freebies_rules: {
      schema: {
        title: "Brindes",
        description: "Adicionar produtos a pre??o zero com filtro por subtotal",
        type: "array",
        items: {
          type: "object",
          title: "Regra para disponibilizar brindes",
          required: [
            "product_ids"
          ],
          additionalProperties: false,
          properties: {
            label: {
              type: "string",
              maxLength: 100,
              title: "R??tulo",
              description: "T??tulo (opcional) da promo????o"
            },
            date_range: {
              type: "object",
              title: "Per??odo de validade",
              description: "Preencha para programar a oferta a datas de in??cio e/ou fim",
              additionalProperties: false,
              properties: {
                start: {
                  type: "string",
                  format: "date-time",
                  title: "In??cio"
                },
                end: {
                  type: "string",
                  format: "date-time",
                  title: "Encerramento"
                }
              }
            },
            product_ids: {
              title: "Produto(s) brinde",
              description: "Lista de produtos fornecidos como pr??mio",
              type: "array",
              items: {
                type: "string",
                pattern: "^[a-f0-9]{24}$",
                title: "ID do produto"
              }
            },
            min_subtotal: {
              type: "integer",
              minimum: 0,
              maximum: 999999999,
              title: "Valor m??nimo",
              description: "Subtotal m??nimo para disponibilizar o brinde"
            },
            customer_ids: {
              title: "Lista de clientes selecionados",
              description: "Se preenchido, os brindes ser??o disponibilizados apenas para estes clientes",
              type: "array",
              items: {
                type: "string",
                pattern: "^[a-f0-9]{24}$",
                title: "ID do cliente"
              }
            },
            check_product_ids: {
              title: "Lista de produtos da campanha",
              description: "Se preenchido, o brinde s?? ser?? aplicado se um dos produtos estiver no carrinho",
              type: "array",
              items: {
                type: "string",
                pattern: "^[a-f0-9]{24}$",
                title: "ID do produto"
              }
            },
            selectable: {
              type: "integer",
              minimum: 0,
              maximum: 999999999,
              title: "Quantidade de brindes",
              description: "Informe a quantidade de brindes que podem ser resgatados para essa promo????o"
            },
          }
        }
      },    
    }    
  }
}


/**
 * List of Procedures to be created on each store after app installation.
 * Ref.: https://developers.e-com.plus/docs/api/#/store/procedures/
 */

const procedures = []

/**
 * Uncomment and edit code above to configure `triggers` and receive respective `webhooks`:

const { baseUri } = require('./__env')

procedures.push({
  title: app.title,

  triggers: [
    // Receive notifications when new order is created:
    {
      resource: 'orders',
      action: 'create',
    },

    // Receive notifications when order financial/fulfillment status are set or changed:
    // Obs.: you probably SHOULD NOT enable the orders triggers below and the one above (create) together.
    {
      resource: 'orders',
      field: 'financial_status',
    },
    {
      resource: 'orders',
      field: 'fulfillment_status',
    },

    // Receive notifications when products/variations stock quantity changes:
    {
      resource: 'products',
      field: 'quantity',
    },
    {
      resource: 'products',
      subresource: 'variations',
      field: 'quantity'
    },

    // Receive notifications when cart is edited:
    {
      resource: 'carts',
      action: 'change',
    },

    // Receive notifications when customer is deleted:
    {
      resource: 'customers',
      action: 'delete',
    },

    // Feel free to create custom combinations with any Store API resource, subresource, action and field.
  ],

  webhooks: [
    {
      api: {
        external_api: {
          uri: `${baseUri}/ecom/webhook`
        }
      },
      method: 'POST'
    }
  ]
})

 * You may also edit `routes/ecom/webhook.js` to treat notifications properly.
 */

exports.app = app

exports.procedures = procedures
