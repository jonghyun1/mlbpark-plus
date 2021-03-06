(function(ls) {
  var reqBlocks = function() {
    var requests = {
      viewReplace: {
        callback: function(res) {
          if (res.url.indexOf('articleVC.php') !== -1) {
            return {
              redirectUrl: res.url.replace('articleVC', 'articleV')
            };
          }
        },
        filter: {
          urls: ['http://mlbpark.donga.com/*']
        },
        extra: ['blocking']
      },

      blockFrame: {
        callback: function() {
          return {
            redirectUrl: 'javascript:void(0)'
          };
        },
        filter: {
          urls: [
            'http://idolpark.donga.com/*',
            'http://sports.donga.com/*',
            'http://mlbpark.donga.com/poll/*',
            'http://openapi.donga.com/SPORTS/suggestion',
            'http://*.doubleclick.net/*',
            'http://mlbpark.donga.com/mypage/memo_read.php'
          ],
          types: ['sub_frame']
        },
        extra: ['blocking']
      },

      blockScript: {
        callback: function() {
          return {
            redirectUrl: 'javascript:void(0)'
          };
        },
        filter: {
          urls: [
            'http://dimg.donga.com/acecounter/*',
            'http://dimg.donga.com/carriage/SPORTS/*',
            'http://pagead2.googlesyndication.com/*',
            'http://www.gstatic.com/*',
            'http://rtax.criteo.com/*'
          ],
          types: ['script']
        },
        extra: ['blocking']
      },

      blockAd: {
        callback: function() {
          return {
            redirectUrl: 'javascript:void(0)'
          };
        },
        filter: {
          urls: [
            'http://ar.donga.com/*',
            'http://cad.donga.com/*',
            'http://mlbpark.donga.com/acecounter/*',
            'http://210.115.150.117/log/*',
            'http://www2.donga.com:8080/*'
          ]
        },
        extra: ['blocking']
      },

      iconReplace: {
        callback: function() {
          var iconSrc = '/images/contents/userIcon.gif';
          return {
            redirectUrl: chrome.extension.getURL(iconSrc)
          };
        },
        filter: {
          urls: [
            'http://mlbpark.donga.com/data/',
            'http://mlbpark.donga.com/data/emoticon/0.gif',
            'http://mlbpark.donga.com/data/emoticon/1.gif'
          ]
        },
        extra: ['blocking']
      }
    };

    var beforeReq = chrome.webRequest.onBeforeRequest;
    var req;

    for (var type in requests) {
      req = requests[type];
      beforeReq.addListener(req.callback, req.filter, req.extra);
    }
  };

  var migrateOptionData = function() {
    if (ls.optionVersion === '2') {
      return;
    }

    var copiedObject = JSON.parse(JSON.stringify(ls));
    ls.clear();
    ls.optionVersion = 2;

    ls.isShowTitleIcon = copiedObject.titIcon == 1;
    ls.isShowTeamIcon = copiedObject.team == 1;
    ls.isBlindContent = copiedObject.blind == 1;
    ls.isBlockArticle = copiedObject.block == 1;
    ls.blockKeywords = keywordTrim(copiedObject.blockInput || '');
    ls.blockType = copiedObject.blockType == 2 ? 'hidden' : 'replace';
    ls.isBlockNickname = copiedObject.blockUser == 1;
    ls.blockNicknames = keywordTrim(copiedObject.blockUserInput || '');
    ls.isShowUserHistory = copiedObject.userHistory == 1;
    ls.isInsertReplyButton = copiedObject.reply == 1;
    ls.isEnableCommentView = copiedObject.userCommentView == 1;
    ls.isResizeVideo = copiedObject.video == 1;
    ls.isBlockNotice = copiedObject.notice == 1;
    ls.isEnableShortcutKey = copiedObject.shortcut == 1;
    ls.isEnableContainerWidth = copiedObject.width == 1;
    ls.containerWith = copiedObject.widthVal || 858;
    ls.isSkipPasswordChange = copiedObject.passwd == 1;

    copiedObject = null;
  };

  var storeDefaultOptionValueIfNotExists = function() {
    ls.isShowTitleIcon = ls.isShowTitleIcon || 'true';
    ls.isShowTeamIcon = ls.isShowTeamIcon || 'true';
    ls.isBlindContent = ls.isBlindContent || 'true';
    ls.isBlockArticle = ls.isBlockArticle || 'false';
    ls.blockKeywords = keywordTrim(ls.blockKeywords || '');
    ls.blockType = ls.blockType || 'replace';
    ls.isBlockNickname = ls.isBlockNickname || 'false';
    ls.blockNicknames = keywordTrim(ls.blockNicknames || '');
    ls.isShowUserHistory = ls.isShowUserHistory || 'false';
    ls.isInsertReplyButton = ls.isInsertReplyButton || 'true';
    ls.isEnableCommentView = ls.isEnableCommentView || 'true';
    ls.isResizeVideo = ls.isResizeVideo || 'true';
    ls.isBlockNotice = ls.isBlockNotice || 'false';
    ls.isEnableShortcutKey = ls.isEnableShortcutKey || 'true';
    ls.isEnableContainerWidth = ls.isEnableContainerWidth || 'false';
    ls.containerWith = ls.containerWith || '858';
    ls.isSkipPasswordChange = ls.isSkipPasswordChange || 'false';
  };

  var postposition = function(str1, str2) {
    return ((this.charCodeAt(this.length - 1) - 0xAC00) % 28 ? str1 : str2);
  };

  var keywordTrim = function(arr) {
    return arr.replace(/\n/g, '').replace(/^[;\s]+|[;\s]+$/g, '').replace(/;[;\s]*;/g, ';');
  };

  var keywordSplitter = function(arr) {
    if (arr) {
      return arr.toLowerCase().split(/[ \t\n]*;[ \t\n]*/);
    } else {
      return [];
    }
  };

  var nicknameSplitter = function(arr) {
    if (arr) {
      return arr.split(/\n*;\n*/);
    } else {
      return [];
    }
  };

  var blocker = function(req, sender, storageName) {
    var content = req.data.content.trim().replace(/^[;\s]+|[;]+$/g, '').replace(/;[;\s]*;/g, ';');
    var localData = ls[storageName];
    var matchExp = new RegExp('(;|^)' + content.replace(/([\[\]\(\)])/g, '\\$1') + '(;|$)');
    var label;

    switch (storageName) {
      case 'blockKeywords':
        label = '단어';
        break;
      case 'blockNicknames':
        label = '닉네임';
         break;
      default:
        label = '키워드';
    }

    var obj = {
      result: false,
      content: content,
      message: null
    };

    if (!content) {
      obj.message = 'error (' + content + ')';
      return obj;
    }

    if (localData.search(matchExp) > 0) {
      obj.message = '"' + content + '"';
      obj.message += content.postposition('은', '는');
      obj.message += ' 이미 차단된 ' + label + ' 입니다.';
      return obj;
    }

    localData += localData ? ';' : '';
    localData += content;
    ls[storageName] = localData;
    obj.result = true;

    return obj;
  };

  var onMessage = function(request, sender, sendResponse) {
    switch (request.action) {
      case 'mbs':
        sendResponse({
          isShowTitleIcon: ls.isShowTitleIcon,
          isShowTeamIcon: ls.isShowTeamIcon,
          isBlindContent: ls.isBlindContent,
          isBlockArticle: ls.isBlockArticle,
          blockKeywords: keywordSplitter(ls.blockKeywords),
          blockType: ls.blockType,
          isBlockNickname: ls.isBlockNickname,
          blockNicknames: nicknameSplitter(ls.blockNicknames),
          isShowUserHistory: ls.isShowUserHistory,
          isInsertReplyButton: ls.isInsertReplyButton,
          isEnableCommentView: ls.isEnableCommentView,
          isResizeVideo: ls.isResizeVideo,
          isBlockNotice: ls.isBlockNotice,
          isEnableShortcutKey: ls.isEnableShortcutKey
        });
        break;
      case 'main':
        sendResponse({
          isBlockArticle: ls.isBlockArticle,
          blockKeywords: keywordSplitter(ls.blockKeywords),
          blockType: ls.blockType
        });
        break;
      case 'width':
        sendResponse({
          isEnableContainerWidth: ls.isEnableContainerWidth,
          containerWith: ls.containerWith
        });
        break;
      case 'passwd':
        sendResponse({
          isSkipPasswordChange: ls.isSkipPasswordChange
        });
        break;
      case 'titleBlockDelivery':
        sendResponse(blocker(request, sender, 'blockKeywords'));
        break;
      case 'userBlockDelivery':
        sendResponse(blocker(request, sender, 'blockNicknames'));
        break;
    }
  };

  reqBlocks();
  migrateOptionData();
  storeDefaultOptionValueIfNotExists();
  chrome.extension.onMessage.addListener(onMessage);
})(localStorage);
