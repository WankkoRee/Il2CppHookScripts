import { getMethodDesFromMethodInfo as methodDEs } from "../bridge/fix/il2cppM"
import { formartClass as FM } from "../utils/formart"

// 侧重参数信息 还有一个 MethodToShow() 用在 findMethod / find_method 侧重基本信息
export function showMethodInfo(mPtr: NativePointer | Il2Cpp.Method): void {
    newLine()
    if (typeof mPtr == "number") {
        if (Process.arch == "arm64" && (String(mPtr).toString().length > 15))
            throw new Error("\nNot support parameter typed number at arm64\n\n\tUse b('0x...') instead\n")
        mPtr = ptr(mPtr)
    } else if (typeof mPtr == "string") {
        if (String(mPtr).startsWith("0x")) {
            mPtr = ptr(mPtr)
        } else {
            throw new Error("\nNot a Pointer\n")
        }
    } else if (mPtr instanceof Il2Cpp.Method) {
        mPtr = mPtr.handle
    }
    let packMethod = new Il2Cpp.Method(mPtr)
    let params = packMethod.parameters.map((param: Il2Cpp.Parameter) => {
        return (`${getLine(8, ' ')}[-]${FM.alignStr(param.name)} | type: ${param.type.handle} | @ class:${param.type.class.handle} | ${param.type.name}`)
    }).join("\n")
    /** like this ↓
     * 
     * [-]Assembly-CSharp @ 0xe21d1520
        [-]Assembly-CSharp.dll @ 0xd937c290 | C:2265
            [-]RewardedVideo @ 0xe240fe30 | M:21 | F:3
            [-]internal Void Show(Boolean> onComplete,String tag) @ MI:0x86aa7f98 & MP: 0xaf1a45f0 ( 0x1e245f0 )
                [-]onComplete  | type: 0xafc77db8 | @ class:0x86c4d0c0 | System.Action<System.Boolean>
                [-]tag         | type: 0xafd4c048 | @ class:0xe2243840 | System.String
     */
    LOGZ(`[-]${packMethod.class.image.assembly.name} @ ${packMethod.class.image.assembly.handle}`)
    LOGZ(`${getLine(2, ' ')}[-]${packMethod.class.image.name} @ ${packMethod.class.image.handle} | C:${packMethod.class.image.classCount}`)
    LOGZ(`${getLine(4, ' ')}[-]${packMethod.class.name} @ ${packMethod.class.handle} | M:${packMethod.class.methods.length} | F:${packMethod.class.fields.length} ${packMethod.class.namespace.length > 0 ? `| N:${packMethod.class.namespace}` : ''}`)
    LOGD(`${getLine(6, ' ')}[-]${methodDEs(packMethod)} @ MI:${packMethod.handle} & MP: ${packMethod.virtualAddress} ( ${packMethod.virtualAddress.isNull() ? ptr(0) : packMethod.relativeVirtualAddress} ) `)
    LOGZ(`${params}`)
    newLine()
}

export const getClassFromMethodInfo = (methodInfoPtr: NativePointer): Il2Cpp.Class => {
    if (typeof methodInfoPtr == "number") {
        if (Process.arch == "arm64" && (String(methodInfoPtr).toString().length > 15))
            throw new Error("\nNot support parameter typed number at arm64\n\n\tUse b('0x...') instead\n")
        methodInfoPtr = ptr(methodInfoPtr)
    } else if (typeof methodInfoPtr == "string") {
        if (!String(methodInfoPtr).startsWith("0x"))
            throw new Error("\nNot a Pointer\n")
        methodInfoPtr = ptr(String(methodInfoPtr))
    }
    return new Il2Cpp.Method(methodInfoPtr).class
}

declare global {
    var showMethodInfo: (methodInfo: NativePointer | Il2Cpp.Method) => void
    var methodToClass: (methodInfo: NativePointer) => NativePointer
    var methodToClassShow: (methodInfo: NativePointer) => void
}

globalThis.showMethodInfo = showMethodInfo
globalThis.methodToClass = (methodInfo: NativePointer) => getClassFromMethodInfo(methodInfo).handle
globalThis.methodToClassShow = (methodInfo: NativePointer) => m(methodToClass(methodInfo))