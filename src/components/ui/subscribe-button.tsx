"use client"

import { Button } from "@/components/ui/button"
import { ButtonProps } from "@/components/ui/button"
import { useState } from "react"
import { loadStripe } from '@stripe/stripe-js';
import { Role, User } from "@/payload-types"

interface SubscribeButtonProps extends ButtonProps {
    priceId?: string      // The Stripe price ID
    id?: string           // The Payload Service doc ID
    amount?: string
    user?: User
    shopId?: string       // The user-selected shop
    tenantId?: string
    isYearly?: boolean
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "")

export function SubscribeButton({
    priceId,
    id: serviceId,
    amount,
    user,
    shopId,
    tenantId,
    isYearly,
    children,
    ...props
}: SubscribeButtonProps) {
    const [isLoading, setIsLoading] = useState(false)

    const userId = user?.id || ""

    async function handleSubscribe() {
        try {
            setIsLoading(true)

            if (!shopId) {
                alert("Please select a shop before subscribing.")
                return
            }

            const stripe = await stripePromise
            if (!stripe) {
                console.error("Stripe is not loaded")
                return
            }

            // Simple success / cancel URLs - no direct "callback" logic
            const successUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/services/`
            const cancelUrl = `${process.env.NEXT_PUBLIC_SERVER_URL}/services`

            // Create the checkout session
            const response = await fetch("/api/create-checkout-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    isYearly,
                    price: priceId,
                    userId,
                    customerEmail: user?.email,
                    serviceId,
                    shopId,
                    tenantId,
                    successUrl,
                    cancelUrl,
                }),
            })

            if (!response.ok) {
                const msg = await response.json()
                throw new Error(msg?.error || "Failed to create checkout session.")
            }

            const session = await response.json()
            if (!session?.sessionId) {
                throw new Error("Stripe sessionId missing in response.")
            }

            // Redirect to Stripe Checkout
            await stripe.redirectToCheckout({ sessionId: session.sessionId })
        } catch (error) {
            console.error("Error:", error)
            alert(error instanceof Error ? error.message : String(error))
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Button
            {...props}
            onClick={handleSubscribe}
            disabled={isLoading || props.disabled}
        >
            {isLoading ? "Loading..." : children}
        </Button>
    )
}
