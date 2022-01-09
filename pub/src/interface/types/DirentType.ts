
export type DirentType =
| ["File", {}]
| ["Directory", {}]
| ["BlockDevice", {}]
| ["CharacterDevice", {}]
| ["SymbolicLink", {}]
| ["FIFO", {}]
| ["Socket", {}]