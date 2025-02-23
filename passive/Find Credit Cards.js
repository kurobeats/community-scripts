// CreditCard Finder by freakyclown@gmail.com

function scan(ps, msg, src)
{
    // lets set up some stuff we are going to need for the alert later if we find a credit card
    var url = msg.getRequestHeader().getURI().toString();
    var body = msg.getResponseBody().toString()
    var alertRisk = [0,1,2,3] //1=informational, 2=low, 3=medium, 4=high
    var alertConfidence = [0,1,2,3,4] //0=fp,1=low,2=medium,3=high,4=confirmed
    var alertTitle = ["Credit Card Number(s) Disclosed (script)",
		  ""]
    var alertDesc = ["Credit Card number(s) was discovered.",
		""]
    var alertSolution = ["why are you showing Credit and debit card numbers?",
		    ""]
    var cweId = [0,1]
    var wascId = [0,1]


    // lets make some regular expressions for well known credit cards
    // regex must appear within /( and )/g

   // regex reviewed and revised by Anthony Cozamanis - kurobeats@yahoo.co.jp
    var re_visa = /(^4[0-9]{12}(?:[0-9]{3})?$)/g //visa
    var re_master = /(5[1-5][0-9]{14})/g //mastercard
    var re_amex = /(3[47][0-9]{13})/g //amex
    var re_disc = /(6(?:011|5[0-9]{2})[0-9]{12})/g //discovery
    var re_diner = /(3(?:0[0-5]|[68][0-9])[0-9]{11})/g //dinersclub
    var re_jcb = /(^(?:2131|1800|35\d{3})\d{11}$)/g //jcb

	// now lets put all of those into a nice array so we can loop over it
	var cards = [re_visa,re_master,re_amex,re_disc,re_diner,re_jcb]


	// here we are going to check the content type and skip over things that
	// wont contain credit cards like jpegs and such like
    var contenttype = msg.getResponseHeader().getHeader("Content-Type")
	var unwantedfiletypes = ['image/png', 'image/jpeg','image/gif','application/x-shockwave-flash', 'application/pdf']
	
	if (unwantedfiletypes.indexOf(""+contenttype) >= 0) 
	{
		// if we find one of the unwanted headers quit this scan, this saves time and reduces false positives
    		return
	}else{
	// right lets run our scan by looping over all the cards in the array above and testing them against the
	// body of the response    
	for (var i=0; i < cards.length; i++)
		{		
		if (cards[i].test(body)) 
			{
			cards[i].lastindex = 0
			var foundCard = []
			var comm
				while (comm = cards[i].exec(body))
				{
					// perform luhn check this checks to make sure its a valid cc number!
					if (luhncheck(comm[0]) ==0){
						foundCard.push(comm[0]);}
				}
			if (foundCard.length !=0){
			ps.raiseAlert(alertRisk[3], alertConfidence[2], alertTitle[0], alertDesc[0], url, '', '', foundCard.toString(), alertSolution[0], '', cweId[0], wascId[0], msg);}
			}

      	}

	}
}
function luhncheck(value){
	// this function is based on work done by DiegoSalazar on github (https://gist.github.com/DiegoSalazar)
	var nCheck = 0, nDigit = 0, bEven = false;
	value = value.replace(/\D/g, "");
 
	for (var n = value.length - 1; n >= 0; n--) {
		var cDigit = value.charAt(n),
			  nDigit = parseInt(cDigit, 10);
 
		if (bEven) {
			if ((nDigit *= 2) > 9) nDigit -= 9;
		}
 
		nCheck += nDigit;
		bEven = !bEven;
	}
	
	// debug here print ("value: " + value + "  lunh: " +nCheck % 10);
	return (nCheck % 10);
}
