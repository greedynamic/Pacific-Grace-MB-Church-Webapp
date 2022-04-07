const amountElement = document.getElementById("amount");
function getAmount25(){
  amountElement.value = '25.00';
}

function getAmount50(){
  amountElement.value = '50.00';
}

function getAmount75(){
  amountElement.value = '75.00';
}

function getAmount100(){
  amountElement.value = '100.00';
}

var isShared;
function isChecked(checkbox){
 if(checkbox.checked){
    isShared = 'yes';
 }
 else{
   isShared = 'no'
 }
}

paypal.Buttons({
  // Sets up the transaction when a payment button is clicked
  createOrder: (data, actions) => {
    if(amountElement == null) {
      alert('Enter a valid value.');
    }
    return actions.order.create({
      purchase_units: [{
        amount: {
          value: amountElement.value 
        }
      }]
    });
  },
  // Finalize the transaction after payer approval
  onApprove: (data, actions) => {
    return fetch(`/api/orders/${data.orderID}/capture`, {
      method:'post',
      headers: {
        'Content-Type' : 'application/JSON'
      },
      body: JSON.stringify({shareInfo : isShared})
    })
      .then((response) => response.json())
      .then((orderData) => {
         // Successful capture! For dev/demo purposes:
         console.log('Capture result', orderData, JSON.stringify(orderData, null, 2));
         document.getElementById('paypal-button-container').remove();
         const innercontent = document.getElementById('donation-box-inner');
         innercontent.innerHTML = "Thank you for supporting your local church!<br><a href='/'>Return to homepage</a>";
        })
      }
    }).render('#paypal-button-container')




  