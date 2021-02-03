const fs = require('fs');

module.exports = {
    tree: {},

    init() {
        this.loadFile(__dirname + '/keywords');
    },

    loadFile(fileName) {
        let words = fs.readFileSync(fileName, "utf8").toString().trim().split(/[\r\n]+/g);
        for (let word of words) {
            this.addWord(word);
        }
    },

    addWord(word) {
        if (word != null || word !== "") {
            let parent = this.tree;
            for (var i = 0; i < word.length; i++) {
                if (!parent[ word[ i ] ]) {
                    parent[ word[ i ] ] = {};
                }
                parent = parent[ word[ i ] ];
            }
            parent.isEnd = true;
        }
    },

    // 检查是否包含敏感词，检查到一个则停止检测
    sensitiveCheck(word) {
        var parent = this.tree,
            exists = false;

        for (var i = 0; i < word.length; i++) {
            // TODO 加强干扰字符的处理
            if (['*', '', ' ', ',', '.', '?'].indexOf(word[ i ]) !== -1) {
                // 过滤掉干扰字符
                continue;
            }

            for (var j = i; j < word.length; j++) {
                console.log(`i=${i}, j=${j}, word[${j}]=${word[ j ]}, parent[word[j]] = ${parent[ word[ j ] ]}`)
                if (!parent[ word[ j ] ]) {
                    exists = false;
                    parent = parent;
                    break;
                }

                if (parent[ word[ j ] ].isEnd) {
                    exists = true;
                    break;
                }
                parent = parent[ word[ j ] ];
            }

            if (exists) {
                break;
            }
        }
        return exists;
    },

    // 替换敏感词
    filter(word, options) {
        let parent = this.tree;
        for (let i = 0; i < word.length; i++) {
            if (['*', '', ' ', ',', '.', '?'].indexOf(word[ i ]) !== -1) {
                // 过滤掉干扰字符
                continue;
            }
            let exists        = false,
                skip          = 0,
                sensitiveWord = '';

            for (let j = i; j < word.length; j++) {
                sensitiveWord = sensitiveWord + word[ j ];
                skip = j - i;
                if (['*', '', ' ', ',', '.', '?'].indexOf(word[ j ]) !== -1) {
                    // 过滤掉干扰字符
                    if (j === word.length - 1 && skip !== 0) {
                        exists = true;
                    }
                    continue;
                }

                if (!parent[ word[ j ] ]) {
                    exists = false;
                    // parent = parent;
                    break;
                }

                // 最大长度匹配
                if (parent[ word[ j ] ].isEnd && (Object.keys(parent[ word[ j ] ]).length === 1 || j === word.length - 1)) {
                    exists = true;
                    break;
                }
                parent = parent[ word[ j ] ];
            }

            if (skip > 1) {
                i += skip - 1;
            }

            if (!exists) {
                continue;
            }

            let stars = '*';
            for (var k = 0; k < skip; k++) {
                stars = stars + '*';
            }

            word = word.replace(new RegExp(sensitiveWord, 'g'), stars);
        }

        if (options && options.callback) {
            options.callback(word);
        } else {
            return word;
        }
    }
};
