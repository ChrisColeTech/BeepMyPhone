export abstract class BaseRepository<T> {
  // TODO: Implement base repository methods
  
  abstract findById(id: string): Promise<T | null>
  abstract findAll(): Promise<T[]>
  abstract create(entity: Partial<T>): Promise<T>
  abstract update(id: string, entity: Partial<T>): Promise<T>
  abstract delete(id: string): Promise<boolean>
  
  protected validateId(id: string): boolean {
    return typeof id === 'string' && id.length > 0
  }
}
