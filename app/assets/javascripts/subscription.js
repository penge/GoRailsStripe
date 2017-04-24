$(document).on('turbolinks:load', function() {
  if ($('#payment-form').length == 0) {
    return; 
  }

  loadStripe();

  $(".use-different-card").click(function(event) {
    event.preventDefault();
    $(".card-on-file").hide();
    $(".card-fields").removeClass("hidden");
  });
});

function loadStripe() {
  var stripeKey = $("meta[name='stripe-key']").attr("content");
  var stripe = Stripe(stripeKey);
  var elements = stripe.elements();

  // Custom styling can be passed to options when creating an Element.
  var style = {
    base: {
      // Add your base input styles here. For example:
      fontSize: '16px',
      lineHeight: '24px'
    }
  };

  // Create an instance of the card Element
  var card = elements.create('card', {style: style});

  // Add an instance of the card Element into the `card-element` <div>
  card.mount('#card-element');

  // Elements validates user input as it is typed
  card.addEventListener('change', function(event) {
    var displayError = document.getElementById('card-errors');
    if (event.error) {
      displayError.textContent = event.error.message;
    } else {
      displayError.textContent = '';
    }
  });

  // Create a token or display an error the form is submitted.
  var form = document.getElementById('payment-form');
  form.addEventListener('submit', function(event) {
    event.preventDefault();

    if ($(".card-fields").hasClass("hidden")) {
      // Use the card on file
      var $form = $('#payment-form');
      $form.submit();
      return;
    }

    stripe.createToken(card).then(function(result) {
      if (result.error) {
        // Inform the user if there was an error
        var errorElement = document.getElementById('card-errors');
        errorElement.textContent = result.error.message;
      } else {
        // Send the token to your server
        stripeTokenHandler(result.token);
      }
    });
  });

  // Submit the token, along with any additional information
  function stripeTokenHandler(token) {
    var $form = $('#payment-form');

    $form.append($('<input type="hidden" name="stripeToken" />')
        .val(token.id));

    $form.append($('<input type="hidden" name="card_last4" />')
        .val(token.card.last4));

    $form.append($('<input type="hidden" name="card_exp_month" />')
        .val(token.card.exp_month));

    $form.append($('<input type="hidden" name="card_exp_year" />')
        .val(token.card.exp_year));

    $form.append($('<input type="hidden" name="card_brand" />')
        .val(token.card.brand));

    // Submit the form
    $form.submit();
  }
}
