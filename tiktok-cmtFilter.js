function removeAccents(x) {
  var from = "àáãảạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệđùúủũụưừứửữựòóỏõọôồốổỗộơờớởỡợìíỉĩịäëïîöüûñçỳýỷỹỵ",
    to = "aaaaaaaaaaaaaaaaaeeeeeeeeeeeduuuuuuuuuuuoooooooooooooooooiiiiiaeiiouuncyyyyy";
  for (var i = 0, l = from.length; i < l; i++) {
    x = x.replace(RegExp(from[i], "gi"), to[i]);
  } return x;
}
function latinConvert(str) {
  y = removeAccents(str).toLowerCase()
    .replace(/[^a-z0-9\-]/g, ' ')
    .replace(/-+/g, ' ').trim();
  return y;
}
/////////////////////////////
var cmtCount = 0, cmtList
  , excludeWords = ['khùng', 'điên', '@', 'chết']
  , minCmtLength = 7
  ;
function checkExcludeWord(s) {
  let x = false;
  excludeWords.forEach(w => {
    if (s.includes(w)) { x = true }
  }); return x;
}
function AkiCmtFilter() {
  cmtList.forEach((e, i) => {
    let z, cmt, cmtRegEx;
    z = e.querySelector('[class*=CommentText] > span');
    if (z) {
      cmt = z.innerHTML;
      cmtRegEx = latinConvert(cmt).match(/\w/g);
      if (cmt.length < minCmtLength) {
        console.log(`cmt ${i} đã ẩn vì quá ngắn | ${cmt}`);
        e.innerHTML = ''; e.style.display = 'none';
      } else if ((checkExcludeWord(cmt)) && (cmt.length < 15)) {
        console.log(`cmt ${i} đã ẩn vì loại trừ | ${cmt}`);
        e.innerHTML = ''; e.style.display = 'none';
      } else if (!cmtRegEx) {
        console.log(`cmt ${i} đã ẩn vì chỉ có icon | ${cmt}`);
        e.innerHTML = ''; e.style.display = 'none';
      } else if (cmtRegEx.length < minCmtLength ) {
        console.log(`cmt ${i} đã ẩn vì quá ngắn sau khi xử lý ký tự | ${cmt}`);
        e.innerHTML = ''; e.style.display = 'none';
      } else {
        e.innerHTML = z.innerHTML;
      }
    }
  });
}
function scrollCheck() {
  cmtList = document.querySelectorAll('[class*=DivCommentItemContainer]');
  if (cmtCount != cmtList.length) {
    cmtCount = cmtList.length;
    console.log('Load: ' + cmtCount);
    AkiCmtFilter();
  }
}
///////////// run /////////////////
window.addEventListener('wheel', scrollCheck);
window.addEventListener('touchmove', scrollCheck);

// AkiScript = document.createElement('script');
// AkiScript.setAttribute('src', 'https://cloud.akivn.net/js/tiktok-cmtFilter.js');
// document.head.appendChild(AkiScript);
