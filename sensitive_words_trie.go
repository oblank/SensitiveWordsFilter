package main

import (
	"fmt"
	"strings"
	"unicode/utf8"
)

// 定义前缀树节点
type TrieNode struct {
	// 子节点
	Children map[rune]*TrieNode
	// 是否终结
	End bool
}

func NewTrieNode() *TrieNode {
	return &TrieNode{
		Children: make(map[rune]*TrieNode),
		End:      false,
	}
}

type TrieFilter struct {
	Root        *TrieNode
	Placeholder rune
}

// eg: Add("fuck")
// {"f": {"u": {"c": {"k": {}, "end": true}, "end": false}, "end": false}, "end": false}
// trie 树实际上是一个 dfa
// (row, column) = transaction
func (t *TrieFilter) Add(kw string) {
	//空字符串
	if len(kw) < 1 {
		return
	}
	chars := []rune(kw)

	node := t.Root

	// 从ROOT开始，循环检查子节点是否存在，不存在则创建一个新的
	for i := 0; i < len(chars); i++ {
		if _, ok := node.Children[chars[i]]; !ok {
			node.Children[chars[i]] = NewTrieNode()
		}
		// 迭代node变量，将其指向找到的子节点
		node = node.Children[chars[i]]
	}
	node.End = true
}

// 敏感词过滤，将敏感词用*替换，//不能直接处理单个字，case会覆盖不全
func (t *TrieFilter) Replace(text string) string {
	chars := []rune(text)
	length := len(chars)
	// 筛选出来的敏感词
	sensitiveKeyWords := make(map[string]bool)

	for i := 0; i < length; i++ {
		node := t.Root
		if _, ok := node.Children[chars[i]]; !ok {
			continue
		}
		var tmpWords []rune
		for j := i; ; j++ {
			if node.End || j >= length {
				sensitiveKeyWords[string(tmpWords)] = true
				// 如果在这里替换会出现多个重复敏感词执行替换的问题!
				i = j - 1
				break
			}

			if _, ok := node.Children[chars[j]]; ok {
				node = node.Children[chars[j]]
				tmpWords = append(tmpWords, chars[j])
			}
		}
	}

	// 循环替换敏感词
	for kw := range sensitiveKeyWords {
		text = strings.ReplaceAll(text, kw, strings.Repeat(string(t.Placeholder), utf8.RuneCountInString(kw)))
	}

	return text
}

func NewTrieFilter() *TrieFilter {
	return &TrieFilter{
		Root:        NewTrieNode(),
		Placeholder: '*',
	}
}

func main() {
	text := "狗狗的狗粉丝在赌博场所说黑话，骂习大习近平骂习近平骂习近平骂习近平骂习近平"

	filter := NewTrieFilter()
	filter.Add("赌博")
	filter.Add("黑话")
	filter.Add("狗粉丝")
	filter.Add("习近平")

	fmt.Println(filter.Replace(text))
	fmt.Println(filter.Replace("这是一段正常的文字"))
}
