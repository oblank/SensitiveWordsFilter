let SensitiveWordsTrie = require("./sensitive_words_trie");


SensitiveWordsTrie.init();
SensitiveWordsTrie.loadFile("./keywords");

function test(w) {
    // console.log(test.sensitiveCheck(w), w, test.filter(w));
    console.log(w, SensitiveWordsTrie.sensitiveCheck(w));
}

test("这是一个习 近平大大的笑话，习近平,,习近平,,");
// test("习近平大大");
// test("习近平");
// test("习近平前妻");
// test("习大大");
// test("习大大 ");
// test("习大大前妻");
// test("小屌丝");