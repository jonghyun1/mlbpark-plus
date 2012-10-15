chrome.webRequest.onBeforeRequest.addListener(
	function() {
		return {redirectUrl:"about:blank"};
	}, {
		urls:[
			"http://idolpark.donga.com/*",
			"http://sports.donga.com/*",
			"http://mlbpark.donga.com/poll/*"
		], types: ["sub_frame"]
	}, ["blocking"]
);

chrome.webRequest.onBeforeRequest.addListener(
	function() {
		return {redirectUrl:"about:blank"};
	}, {
		urls:[
			"http://ar.donga.com/*",
			"http://cad.donga.com/*",
			"http://mlbpark.donga.com/acecounter/*",
			"http://210.115.150.117/log/*",
			"http://mlbpark.donga.com/mypage/memo_read.php",
			"http://www2.donga.com:8080/*",
			"http://sports.donga.com/pictorial/*"
		]
	}, ["blocking"]
);

chrome.webRequest.onBeforeRequest.addListener(
	function() {
		return {redirectUrl:chrome.extension.getURL('/images/userIcon.gif')};
	}, {
		urls:[
			"http://mlbpark.donga.com/data/",
			"http://mlbpark.donga.com/data/emoticon/0.gif",
			"http://mlbpark.donga.com/data/emoticon/1.gif"
		]
	}, ["blocking"]
);

function onMessage(request, sender, sendResponse) {
	switch (request.action){
		case 'mbs':
			sendResponse({
				titIcon: localStorage["titIcon"],
				team: localStorage["team"],
				blind: localStorage["blind"],
				block: localStorage["block"],
				blockInput: localStorage["blockInput"],
				blockType: localStorage["blockType"],
				blockUser: localStorage["blockUser"],
				blockUserInput: localStorage["blockUserInput"],
				userHistory: localStorage["userHistory"],
				reply: localStorage["reply"],
				userCommentView: localStorage["userCommentView"],
				video: localStorage["video"],
				notice: localStorage["notice"],
				shortcut: localStorage["shortcut"],
				imageSearch: localStorage["imageSearch"]
			});
		break;
		case 'width':
			sendResponse({
				width: localStorage["width"],
				widthVal: localStorage["widthVal"]
			});
		break;
		case 'passwd':
			sendResponse({
				passwd: localStorage["passwd"]
			});
		break;
	}
}
chrome.extension.onMessage.addListener(onMessage);