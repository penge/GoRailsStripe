Stripe.api_key = STRIPE_SECRET

class RecordCharges
  def call(event)
    charge = event.data.object

    # Look up user
    user = User.find_by(stripe_id: charge.customer)

    # Save charge into database
    user.charges.create(
      stripe_id: charge.id,
      amount: charge.amount,
      card_last4: charge.source.last4,
      card_exp_month: charge.source.exp_month,
      card_exp_year: charge.source.exp_year,
      card_brand: charge.source.brand
    )
  end
end

StripeEvent.configure do |events|
  events.subscribe 'charge.succeeded', RecordCharges.new
end

