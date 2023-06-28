// 联合类型不需要递归提取每个元素，TypeScript 内部会把每一个元素传入单独做计算，之后把每个元素的计算结果合并成联合类型。
type CamelcaseUnion<Item extends string> = Item extends `${infer Left}_${infer Right}${infer Rest}`
  ? `${Left}${Uppercase<Right>}${CamelcaseUnion<Rest>}`
  : Item;

type CamelcaseUnionResult = CamelcaseUnion<'aa_aa_aa' | 'bb_bb_bb'>; // "aaAaAa" | "bbBbBb"

// 判断联合类型
// 是不是在心里会问：什么鬼？这段逻辑是啥？
// 这就是分布式条件类型带来的认知成本。
type IsUnion<A, B = A> = A extends A ? ([B] extends [A] ? false : true) : never;

type IsUnionResult = IsUnion<'a' | 'b' | 'c'>; // true

type IsUnionResult2 = IsUnion<['a' | 'b' | 'c']>; // false

// 我们先来看这样一个类型
type TestUnion<A, B = A> = A extends A ? { a: A; b: B } : never;

//A 和 B 都是同一个联合类型，为啥值还不一样呢？
// 因为条件类型中如果左边的类型是联合类型，会把每个元素单独传入做计算，而右边不会。
/* {
  a: "a";
  b: "a" | "b" | "c";
} | {
  a: "b";
  b: "a" | "b" | "c";
} | {
  a: "c";
  b: "a" | "b" | "c";
} */
type TestUnionResult = TestUnion<'a' | 'b' | 'c'>;

// bem 是 css 命名规范，用 block__element--modifier 的形式来描述某个区块下面的某个元素的某个状态的样式。
// 那么我们可以写这样一个高级类型，传入 block、element、modifier，返回构造出的 class 名：
type BEM<
  Block extends string,
  Element extends string[],
  Modifier extends string[],
> = `${Block}__${Element[number]}--${Modifier[number]}`;

// 字符串类型中遇到联合类型的时候，会每个元素单独传入计算，也就是这样的效果
// "hello__world--success" | "hello__world--warning" | "hello__world--error" | "hello__wide--success" | "hello__wide--warning" | "hello__wide--error"
type BEMResult = BEM<'hello', ['world', 'wide'], ['success', 'warning', 'error']>;

// 实现一个全组合的高级类型，也是联合类型相关的：
// 希望传入 'A' | 'B' 的时候，能够返回所有的组合： 'A' | 'B' | 'BA' | 'AB'。
type Combination<A extends string, B extends string> = A | B | `${A}${B}` | `${B}${A}`;

// 字符串类型中遇到联合类型的时候，会每个元素单独传入计算
type CombinationResult = Combination<'A', 'B' | 'C'>; // "A" | "B" | "C" | "AB" | "AC" | "BA" | "CA"

// 类型参数 A、B 是待组合的两个联合类型，B 默认是 A 也就是同一个
// A extends A 的意义就是让联合类型的每个类型单独传入做处理
// A 的处理就是 A 和 B 中去掉 A 以后所有的类型组合，也就是 Combinations<A, B 去掉 A 以后的所有组合>
// 而 B 去掉 A 以后的所有组合就是 AllCombinations<Exclude<B, A>>
// 所以全组合就是 Combinations<A, AllCombinations<Exclude<B, A>>>
type AllCombinations<A extends string, B extends string = A> = A extends A
  ? Combination<A, AllCombinations<Exclude<B, A>>>
  : never;

// 用分布式计算
// Combination<"A", AllCombinations<B|C>>
// Combination<"B", AllCombinations<A|C>>
// Combination<"C", AllCombinations<A|B>>
// 再内联Combination<B,C>Combination<B,A>Combination<A,B>
// 最后全排列
// "A" | "B" | "C" | "BC" | "CB" | "AB" | "AC" | "ABC" | "ACB" | "BA" | "CA" | "BCA" | "CBA" | "BAC" | "CAB"
type AllCombinationsResult = AllCombinations<'A' | 'B' | 'C'>;
