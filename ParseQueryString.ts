/**
 * 传入 a=1&a=2&b=3&c=4
 * 返回 {
    a: ["1", "2"];
    b: "3";
    c: "4";
}
 */
type ParseQueryString<Str extends string> = Str extends `${infer Param}&${infer Rest}`
  ? MergeParams<ParseParam<Param>, ParseQueryString<Rest>>
  : ParseParam<Str>;

// 解析参数并构造
type ParseParam<Param extends string> = Param extends `${infer Key}=${infer Value}`
  ? {
      [K in Key]: Value;
    }
  : {};

// 合并参数
type MergeParams<OneParam extends Record<string, any>, OtherParam extends Record<string, any>> = {
  // 类型参数 OneOParam OtherParam 是要合并的 QueryParam。构造一个新的索引类型返回，索引来自两个类型参数的合并。
  // 也就是 [Key in keyof OneParam | keyof OtherParam]
  [Key in keyof OneParam | keyof OtherParam]: Key extends keyof OneParam // Key 的类型匹配 OneParam 吗
    ? Key extends keyof OtherParam // Key 的类型也匹配 OtherParams 吗
      ? MergeValues<OneParam[Key], OtherParam[Key]> // 都匹配得上就进行值合并
      : OneParam[Key] // 否则就是 OneParam 的值
    : Key extends keyof OtherParam // 否则，Key 的类型匹配 OtherParam 吗
    ? OtherParam[Key] // OtherParam 的值
    : never;
};

// 合并 OneParam 和 OtherParam 同时存在的索引的值
type MergeValues<One, Other> = One extends Other ? One : Other extends unknown[] ? [One, ...Other] : [One, Other];

/* {
    a: ["1", "2"];
    b: "3";
    c: "4";
} */
type ParseQueryStringResult = ParseQueryString<'a=1&a=2&b=3&c=4'>;

// 自己手写
/* type ParseQueryString<Str extends string> = Str extends `${infer FirstParam}&${infer Rest}`
  ? MergeParams<ParseParam<FirstParam>, ParseQueryString<Rest>>
  : ParseParam<Str>;

type ParseParam<Param extends string> = Param extends `${infer K}=${infer V}`
  ? {
      [Key in K]: V;
    }
  : {};

type MergeParams<FirstParam extends Record<string, any>, OtherParam extends Record<string, any>> = {
  [Key in keyof FirstParam | keyof OtherParam]: Key extends keyof FirstParam
    ? Key extends keyof OtherParam
      ? MergeValues<FirstParam[Key], OtherParam[Key]>
      : FirstParam[Key]
    : Key extends keyof OtherParam
    ? OtherParam[Key]
    : never;
};

type MergeValues<FirstValue, OtherValue> = FirstValue extends OtherValue ? [FirstValue] : [FirstValue, OtherValue];

type ParseQueryStringResult = ParseQueryString<'a=1&a=2&b=3&c=4'>; */
