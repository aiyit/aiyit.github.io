window.onload = function() {
    // <h1> 태그 다음 위치(body 요소 내)에 새로운 문단을 생성하여 추가
    var newParagraph = document.createElement("p");
    newParagraph.textContent = "안녕하세요! 자바스크립트를 통해 동적으로 생성된 문자입니다.";
    
    // body 태그 안에 새로운 문단 추가
    document.body.appendChild(newParagraph);
};
