
// Form javascrypt
// the form id is myForm
$('#myform').on('submit', function(event) {
    event.preventDefault(); // prevent reload
	setTimeout(function() {
		$('#myform')[0].reset();
	},1500)
    
    var formData = new FormData(this);
    formData.append('service_id', 'Portfolio');
    formData.append('template_id', 'template_jsoaey7');
    formData.append('user_id', 'user_XaRpJR9wJvgYfIxDUDzSo');
 
    $.ajax('https://api.emailjs.com/api/v1.0/email/send-form', {
        type: 'POST',
        data: formData,
        contentType: false, // auto-detection
        processData: false // no need to parse formData to string
    }).done(function() {
        alert('Your mail is sent!');
		
    }).fail(function(error) {
        alert('Oops... ' + JSON.stringify(error));
    });
});
// code fragment
