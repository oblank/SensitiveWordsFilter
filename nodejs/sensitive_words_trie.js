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

    // 添加敏感词，构建Trie
    addWord(word) {
        if (word != null || word !== "") {
            let parent = this.tree;
            for (let i = 0; i < word.length; i++) {
                if (!parent[ word[ i ] ]) {
                    parent[ word[ i ] ] = {};
                }
                parent = parent[ word[ i ] ];
            }
            parent.isEnd = true;
        }
    },

    // 移除空格
    removeSpace(text) {
        return text.toString().trim().replace(/[\s| ]/ig, '');
    },

    // 检查是否包含敏感词，检查到一个则停止检测
    sensitiveCheck(word) {
        word = this.removeSpace(word);
        if (word === "" || word === null) {
            return word;
        }

        let parent = this.tree,
            exists = false;

        for (let i = 0; i < word.length; i++) {
            // TODO 加强干扰字符的处理
            if (['*', '', ' ', ',', '.', '?'].indexOf(word[ i ]) !== -1) {
                // 过滤掉干扰字符
                continue;
            }

            for (let j = i; j < word.length; j++) {
                if (!parent[ word[ j ] ]) {
                    exists = false;
                    break;
                } else if (parent[ word[ j ] ] && parent[ word[ j ] ].isEnd) {
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
    replace(text, options) {
        text = this.removeSpace(text);
        if (text === "" || text === null) {
            return text;
        }

        if (!options) {
            options = {}
        }
        if (options.placeholder === undefined) {
            options.placeholder = "*"
        }

        let sensitiveKeyWords = {};
        for (let i = 0; i < text.length; i++) {
            let parent = this.tree;
            if(parent[text[i]] === null  || parent[text[i]] === undefined) {
                continue
            }

            let tmpWords = [];
            for (let j = i; j < text.length; j++) {
                // 找到了就暂存，并将parent指向其子节点
                if (parent[ text[ j ] ] !== undefined) {
                    tmpWords.push(text[ j ]);
                    if (parent[text[j]].isEnd) {
                        sensitiveKeyWords[tmpWords.join("")] = true;
                        // 减少外层循环次数
                        i = j;
                        break
                    }
                    parent = parent[ text[ j ] ];
                }
            }
        }

        // 替换
        Object.keys(sensitiveKeyWords).forEach(keyWord => {
            text = text.replace(new RegExp(keyWord, 'g'), options.placeholder.toString().repeat(keyWord.length));
        });

        if (options && options.callback) {
            options.callback(text);
        } else {
            return text;
        }
    }
};
