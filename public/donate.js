const amountElement = document.getElementById("amount");
paypal.Buttons({
    // Sets up the transaction when a payment button is clicked
    createOrder: (data, actions) => {
      if(amountElement == null) {
        alert('Enter a valid value.');
      }
      return actions.order.create({
        purchase_units: [{
          amount: {
            value: amountElement.value // Can also reference a variable or function
          }
        }]
      });
    },
    // Finalize the transaction after payer approval
    onApprove: (data, actions) => {
      return actions.order.capture().then(function(orderData) {
        // Successful capture! For dev/demo purposes:
        console.log('Capture result', orderData, JSON.stringify(orderData, null, 2));
        const transaction = orderData.purchase_units[0].payments.captures[0];
        // When ready to go live, remove the alert and show a success message within this page. For example:
        // const element = document.getElementById('paypal-button-container');
        // element.innerHTML = '<h3>Thank you for your payment!</h3>';
        // Or go to another URL:  actions.redirect('thank_you.html');
        // alert(`Transaction ${transaction.status}: ${transaction.id}`);
        document.getElementById('paypal-button-container').remove();
        const innercontent = document.getElementById('donation-box-inner');
        innercontent.innerHTML = "Thank you for supporting your local church!<br><a href='/'>Return to homepage</a>";
      });
    }
  }).render('#paypal-button-container');