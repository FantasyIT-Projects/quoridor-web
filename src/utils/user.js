// 用户逻辑

/**
 * 根据用户名hash生成用户id
 *
 * @param {string} username 用户名
 * @returns {string} 用户id
 * @author ChiyukiRuon
 * */
export function generateId(username) {
    let hash = 0
    for (let i = 0; i < username.length; i++) {
        hash = ((hash << 5) - hash) + username.charCodeAt(i) // 使用位移和异或实现简单的哈希
        hash |= 0 // 将结果转换回32位整数
    }
    return hash.toString();
}