var reader = null;
var pcsc = null;
var atr = null;

function log(txt) {
	console.log(txt);
}

function PINUnblock() {
	 document.getElementById("pin-unblock").innerHTML = "---";
	log("A02C000010" + PUK.value + PIN.value + "FFFFFFFF")
	pcsc.exchangeAPDU("A02C000010" +  + PUK.value + PIN.value + "FFFFFFFF",  PINUnblockCallback);
	//log("A02C000010333738353136343030303030FFFFFFFF");
	//pcsc.exchangeAPDU("A02C000010333738353136343030303030FFFFFFFF",  PINUnblockCallback);
}	

var PINUnblockCallback = {
	success : function(sw, dataout) {
		log(dataout + sw);
		document.getElementById("pin-unblock").innerHTML = dataout + sw;
	}
}	

function VerifyPIN() {
	document.getElementById("verify-pin").innerHTML = "---";
	log("0020000108" + PIN.value+ "FFFFFFFF");
	pcsc.exchangeAPDU("0020000108" + PIN.value+ "FFFFFFFF", verifyPINCallback);
}	

var verifyPINCallback = {
	success : function(sw, dataout) {
		log(dataout + sw);
		document.getElementById("verify-pin").innerHTML = dataout + sw;
	},
}	

function UpdateMSISDN() {	
	document.getElementById("read-result").innerHTML = "udpating";
	log("00DC01040E" + NewMSISDN.value);
	pcsc.exchangeAPDU("00DC01040E" + NewMSISDN.value, updateMSISDNCallback);
}; 

var updateMSISDNCallback = {
	success : function(sw, dataout) {
		log(dataout + sw);
		log("00B201040E");
		pcsc.exchangeAPDU("00B2010400", readMSISDNCallback);
	},
}	

function ReadMSISDN() {	
	log("00A4090C047F106F40");
	pcsc.exchangeAPDU("00A4090C047F106F40", selectMSISDNCallback);
}; 

var readMSISDNCallback = {
	success : function(sw, dataout) {
		log(dataout + sw);
		document.getElementById("read-result").innerHTML = dataout;
		NewMSISDN.value = dataout;
	},
}	

var selectMSISDNCallback = {
	success : function(sw, dataout) {
		log(dataout + sw);
		log("00B2010400");
		//pcsc.exchangeAPDU("00B201040E", readMSISDNCallback);
		pcsc.exchangeAPDU("00B2010400", readMSISDNCallback);
	},
}	

var selectMFCallback = {
	success : function(sw, dataout) {
		log(dataout + sw);
		if (sw == "9000") {
			document.getElementById("MF").innerHTML = "YES";
		}
		else {
			document.getElementById("MF").innerHTML = "NO";
		}
	}
}	

function selectMF() {
	log("00A4090C023F00");
	pcsc.exchangeAPDU("00A4090C023F00", selectMFCallback);
}

var connectCallback = {
	success : function() {	
		document.getElementById("atr").innerHTML = atr;
	},
}

var createCallback = {
	success : function(_pcsc) {
		pcsc = _pcsc;		
		pcsc.connect(reader, connectCallback);
	},
}

var irCallback = {

	onCardInsertion : function(resp) {
		reader = resp.readerName;
		atr = resp.ATR;
		SConnect.PCSC.Create(createCallback);
	},	
	onCardRemoval : function(resp) {
        document.getElementById("atr").innerHTML = "---";
        document.getElementById("MF").innerHTML = "---";
        document.getElementById("read-result").innerHTML = "--";
        document.getElementById("verify-pin").innerHTML = "--";
        document.getElementById("pin-unblock").innerHTML = "--";
        NewMSISDN.value = "";
        
		if (pcsc)
			pcsc.dispose();
	},
};

var installAddOnsCallback = {
	success : function() { 
		SConnect.PCSC.RegisterCardIRHandler(irCallback);
	},
};

var validateCallback = {
	success : function() {
		SConnect.InstallAddOns([new SConnect.PCSCInfo()], installAddOnsCallback);
	},
}

function onpageload() {
	var installCallback = {
			success : function() {
			SConnect.ValidateServer(validateCallback);						
		},
	};
	SConnect.Install(installCallback);
}

function onpageunload() {
	SConnect.PCSC.UnregisterCardIRHandler();
	if (pcsc)
		pcsc.dispose();
}
			
window.onload = onpageload;
window.onunload = onpageunload;

