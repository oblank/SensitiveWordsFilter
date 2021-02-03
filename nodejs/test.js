let SensitiveWordsTrie = require("./sensitive_words_trie");


SensitiveWordsTrie.init();

function test(w) {
    console.log(SensitiveWordsTrie.sensitiveCheck(w), SensitiveWordsTrie.replace(w));
    // console.log(w, SensitiveWordsTrie.sensitiveCheck(w));
}

test("狗狗的狗粉丝在赌博场所说黑话，骂习大习近平骂习近平骂习近平骂习近平骂习近平");
test("这是一段正常的文字");