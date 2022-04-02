export interface IStorage {
  type: 'local' | 'session'
  getStorageType: (type: IStorage['type'] | undefined) => IStorage['type']
  get: <T>(key: string, type: IStorage['type']) => T
  set: (key: string, data: unknown, type: IStorage['type']) => void
}

class Storage implements IStorage {
  type: IStorage['type']

  constructor(type: IStorage['type'] = 'local') {
    this.type = type
  }

  getStorageType(type: IStorage['type'] | undefined) {
    if (type) {
      return type
    }

    return this.type
  }

  /**
   *
   * @param key - 当前要获取的key
   * @param type - 当前要在哪里获取 localStorage ｜ sessionStorage 不传时按constructor type
   */
  get = <T = unknown>(key: string, type?: IStorage['type']): T => {
    const storageType = this.getStorageType(type)

    let data: string | null = ''
    if (storageType === 'local') {
      data = localStorage.getItem(key)
    } else {
      data = sessionStorage.getItem(key)
    }

    try {
      return JSON.parse(data as string) as T
    } catch {
      return data as unknown as T
    }
  }

  /**
   *
   * @param key - 当前要储存的key
   * @param data - 当前要获取的数据
   * @param type - 要存储在哪里 localStorage ｜ sessionStorage 不传时按constructor type
   */
  set = (key: string, data: unknown, type?: IStorage['type']) => {
    let storageData = data
    const storageType = this.getStorageType(type)

    if (typeof storageData === 'object' && storageData !== null) {
      storageData = JSON.stringify(data)
    }

    if (storageType === 'local') {
      localStorage.setItem(key, storageData as string)
    } else {
      sessionStorage.setItem(key, storageData as string)
    }
  }

  /**
   * @param type - 要存储在哪里 localStorage ｜ sessionStorage 不传时按constructor type
   */
  clear = (type: IStorage['type']) => {
    const storageType = this.getStorageType(type)
    if (storageType === 'local') {
      localStorage.clear()
    } else {
      sessionStorage.clear()
    }
  }
}

export default new Storage()
