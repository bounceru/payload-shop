// File: /src/email/generateOrderSummaryEmail.ts
import { generateEmailHTML } from './generateEmailHTML'

// Extend the param interface to carry more data
// Extend the param interface to carry more data
export interface OrderSummaryParams {
  shopOrdNr: number; // <-- ADDED: to display the shop-based order number
  orderNumber: string; // your original ID if needed
  orderStatusUrl: string; // e.g. "http://localhost:3000/order-status?orderId=6791..."
  itemLines: {
    name: string
    quantity: number
    price: number
    subproducts: {
      name: string
      price: number
    }[]
  }[]
  totalPrice: string
  shippingCost?: string
  serviceCost?: string
  fulfillmentMethod?: string
  customerDetails?: {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    address?: string
    city?: string
    postalCode?: string
  }
  branding?: {
    logoUrl?: string
    siteTitle?: string
    headerBackgroundColor?: string
    primaryColorCTA?: string
    googleReviewUrl?: string
    tripAdvisorUrl?: string
    [key: string]: any
  }
}

// We'll generate a fancy table in HTML
export const generateOrderSummaryEmail = async (params: OrderSummaryParams) => {
  const {
    shopOrdNr,           // e.g. 57
    orderNumber,         // e.g. "6791..." (internal ID) if needed
    orderStatusUrl,
    itemLines,
    totalPrice,
    shippingCost,
    serviceCost,
    fulfillmentMethod = 'takeaway',
    customerDetails,
    branding,
  } = params

  // Build an HTML table of items
  let itemsTableRows = ''
  for (const line of itemLines) {
    // For subproducts
    let subRows = ''
    if (line.subproducts && line.subproducts.length > 0) {
      subRows = line.subproducts
        .map(
          sp => `
            <div style="margin-left: 20px; font-size: 14px; color: #666;">
              + ${sp.name} (€${sp.price.toFixed(2)})
            </div>`,
        )
        .join('')
    }

    itemsTableRows += `
      <tr>
        <td style="padding: 8px;">
          ${line.quantity} × ${line.name}
          ${subRows}
        </td>
        <td style="padding: 8px; text-align: right;">
          €${(line.price * line.quantity).toFixed(2)}
        </td>
      </tr>
    `
  }

  // Convert the fulfillmentMethod code to Dutch
  let fulfillmentStr = ''
  switch (fulfillmentMethod) {
    case 'delivery':
      fulfillmentStr = 'Levering aan huis'
      break
    case 'takeaway':
      fulfillmentStr = 'Afhaling'
      break
    case 'dine_in':
      fulfillmentStr = 'Ter plaatse eten'
      break
    default:
      fulfillmentStr = 'Afhaling'
  }

  // Optionally, show shipping row if shippingCost > 0
  const shippingFloat = parseFloat(shippingCost || '0')
  const showShippingRow = shippingFloat > 0

  // The main content in Dutch
  const advancedContent = `
    <p style="margin-bottom: 1rem;">Hallo ${customerDetails?.firstName || ''
  }, bedankt voor uw bestelling!</p>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 1rem;">
      <thead>
        <tr style="background-color: #f5f5f5;">
          <th style="padding: 8px; text-align: left;">Artikel</th>
          <th style="padding: 8px; text-align: right;">Regeltotaal</th>
        </tr>
      </thead>
      <tbody>
        ${itemsTableRows}
      </tbody>
    </table>

    ${showShippingRow
    ? `<div style="text-align: right; margin-bottom: 0.5rem;">
             <strong>Verzendkosten:</strong> €${shippingCost}
           </div>`
    : ''
  }

    ${serviceCost
    ? `<div style="text-align: right; margin-bottom: 0.5rem;">
             <strong>Servicekosten:</strong> €${serviceCost}
           </div>`
    : ''
  }

    <div style="text-align: right; margin-bottom: 1.5rem;">
      <strong style="font-size: 1.2rem;">
        Totaal bedrag: €${totalPrice}
      </strong>
    </div>

    <div style="margin-bottom: 1rem;">
      <strong>Afhandelingsmethode:</strong> ${fulfillmentStr}
    </div>

    ${customerDetails?.address
    ? `<div style="margin-bottom: 1rem;">
             <strong>Afleveradres:</strong><br/>
             ${customerDetails.address || ''}<br/>
             ${customerDetails.postalCode || ''} ${customerDetails.city || ''}<br/>
             ${customerDetails.phone || ''}
           </div>`
    : ''
  }

    <p style="margin-bottom: 1rem;">
      Wij nemen contact met u op als we nog vragen hebben over uw bestelling.
      Alvast bedankt en tot snel!
    </p>

    <!-- Example for review links if branding has them -->
    ${branding?.googleReviewUrl || branding?.tripAdvisorUrl
    ? `<div style="margin-top: 2rem; padding: 1rem; background-color: #f0f0f0;">
             <p style="margin: 0 0 0.5rem;">
               Tevreden van uw bestelling? Laat gerust een review achter:
             </p>
             ${branding.googleReviewUrl
      ? `<a href="${branding.googleReviewUrl
      }" target="_blank" style="margin-right: 20px; text-decoration: none; color: #007bff;">Google Review</a>`
      : ''
    }
             ${branding.tripAdvisorUrl
      ? `<a href="${branding.tripAdvisorUrl
      }" target="_blank" style="text-decoration: none; color: #007bff;">TripAdvisor</a>`
      : ''
    }
           </div>`
    : ''
  }
  `

  // For the headline, we now show "Bestelling #<shopOrdNr>"
  // If you still want to include the main ID or not is up to you.
  const headlineText = branding?.siteTitle
    ? `${branding.siteTitle} – Bestelling #${shopOrdNr}`
    : `Bestelling #${shopOrdNr}`

  // Finally, generate the full HTML via your existing template
  return generateEmailHTML({
    headline: headlineText,
    content: advancedContent,
    // If you want the CTA in Dutch, too:
    cta: {
      buttonLabel: 'Bekijk bestelstatus',
      url: orderStatusUrl, // or shopOrdNr
    },
    brandLogoUrl: branding?.siteLogo?.s3_url,
    brandHeaderColor: branding?.headerBackgroundColor,
  })
}

