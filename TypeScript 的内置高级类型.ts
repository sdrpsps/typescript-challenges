// Parameters 用于提取函数类型的参数类型
type ParametersResult = Parameters<(name: string, age: number) => unknown>; // [name: string, age: number]

// ReturnType 用于提取函数类型的返回值类型
type ReturnTypeResult = ReturnType<() => 'HELLO WORLD'>; // "HELLO WORLD"

// 构造器类型和函数类型的区别就是可以被 new
// ConstructorParameters 用于提取构造器参数的类型
interface Person {
  name: string;
}

interface PersonConstructor {
  new (name: string): Person;
}

type ConstructorParametersResult = ConstructorParameters<PersonConstructor>; // [name: string]

// InstanceType 用于提取构造器返回值的类型
type InstanceTypeResult = InstanceType<PersonConstructor>; // Person

// ThisParameterType 用于提取 this 的类型
function hello(this: Person) {
  console.log(this.name);
}

type ThisParameterTypeResult = ThisParameterType<typeof hello>; // Person

// OmitThisParameter 用于删除 this 的类型
type OmitThisParameterResult = OmitThisParameter<typeof hello>;

// Partial 用于把索引变为可选
/* {
    name?: "hello" | undefined;
    age?: 20 | undefined;
} */
type PartialResult = Partial<{ name: 'hello'; age: 20 }>;

// Required 用于去除可选
/* { name: 'hello'; age: 20 } */
type RequiredResult = Required<{ name?: 'hello'; age?: 20 }>;

// Readonly 用于添加 readonly 的修饰
/* {
    readonly name: 'hello';
    readonly age: 20;
} */
type ReadonlyResult = Readonly<{ name: 'hello'; age: 20 }>;

// Pick 用于构造新的索引类型，在构造的过程中可以对索引和值做一些修改或过滤
// { age: 20 }
type PickResult = Pick<{ name: 'hello'; age: 20 }, 'age'>;

// Record 用于创建索引类型，传入 key 和值的类型
/* {
    a: number;
    b: number;
} */
type RecordResult = Record<'a' | 'b', number>;

// Exclude 用于从一个联合类型中去掉一部分类型时
type ExcludeResult = Exclude<'a' | 'b' | 'c' | 'd', 'a' | 'b'>; // "c" | "d"

// Extract 与 Exclude 相反
type ExtractResult = Extract<'a' | 'b' | 'c' | 'd', 'a' | 'b'>; // "a" | "b"

// Omit 与 Pick 相反，去除部分索引构造新的索引类型
/* {
    age: 20;
} */
type OmitResult = Omit<{ name: 'hello'; age: 20 }, 'name'>;

// Awaited 用于获取 Promise 的 ValueType
type AwaitedResult = Awaited<Promise<Promise<Promise<number>>>>; // number

// NonNullable 用于判断是否为非空类型，也就是不是 null 或 undefined 的类型的
type NonNullableResult = NonNullable<null>; // null

type NonNullableResult2 = NonNullable<{}>; // {}

// Uppercase 大写 Lowercase 小写 Capitalize 首字母大写 Uncapitalized 首字母小写
type UppercaseResult = Uppercase<'aaaa'>; // AAAA

type LowercaseResult = Lowercase<'AAAA'>; // aaaa

type CapitalizeResult = Capitalize<'aaaa'>; // Aaaa

type UncapitalizedResult = Uncapitalize<'aAAA'>; // aAAA
