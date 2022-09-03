import {
  getRepository as _getRepository,
  EntityTarget,
  DeepPartial,
  EntityManager,
  ObjectLiteral,
  FindManyOptions
} from "typeorm";
import {ObjectID} from "typeorm/driver/mongodb/typings";
import {FindConditions} from "typeorm/find-options/FindConditions";
import {FindOneOptions} from "typeorm/find-options/FindOneOptions";
import {BaseEntity} from "../entities/BaseEntity";
import {Service} from "typedi";
import {DateTime} from "luxon";

type DeleteCriteria<T> = string | string[] | number | number[] | Date | Date[] | ObjectID | ObjectID[] | FindConditions<T>;

export const DateTimeColumn = {
  type: Date,
  transformer: {
    to: (value: DateTime): Date => value.toJSDate(),
    from: (value: Date): DateTime => DateTime.fromJSDate(value)
  }
};

@Service()
export class Database {
  constructor(
    private manager: EntityManager
  ) {}

  qb<T extends ObjectLiteral>(entityClass: EntityTarget<T>, alias: string) {
    return this.manager.createQueryBuilder(entityClass, alias);
  }

  create<T extends ObjectLiteral>(entityClass: EntityTarget<T>, entityLike: DeepPartial<T>): T {
    return getRepository<T>(entityClass).create(entityLike);
  }

  async insert<T extends ObjectLiteral, K extends DeepPartial<T> = DeepPartial<T>>(entityClass: EntityTarget<T>, entity: K): Promise<T> {
    return insert(entityClass, entity, this.manager);
  }

  async save<T extends ObjectLiteral, K extends DeepPartial<T> = DeepPartial<T>>(entityClass: EntityTarget<T>, entity: K): Promise<T> {
    return save(entityClass, entity, this.manager);
  }

  async remove<T extends ObjectLiteral, C extends DeleteCriteria<T> = DeleteCriteria<T>>(entityClass: EntityTarget<T>, criteria: C): Promise<number> {
    return remove(entityClass, criteria, this.manager);
  }

  async upsert<T extends BaseEntity>(entityClass: EntityTarget<T>, data: DeepPartial<T>) {
    return upsert(entityClass, data, this.manager);
  }

  async delsert<T extends BaseEntity, D extends DeepPartial<T> = DeepPartial<T>>(entityClass: EntityTarget<T>, criteria: DeleteCriteria<T>, data: D): Promise<T> {
    return delsert(entityClass, criteria, data, this.manager)
  }

  async findAll<T extends ObjectLiteral, K = FindManyOptions<T>>(entityClass: EntityTarget<T>, options: K): Promise<T[]> {
    return getRepository(entityClass, this.manager).find(options);
  }

  async findOne<T extends ObjectLiteral, K = FindOneOptions<T>>(entityClass: EntityTarget<T>, options: K): Promise<T | undefined> {
    return findOne(entityClass, options, this.manager);
  }

  async findOneOrFail<T extends ObjectLiteral, K extends FindOneOptions<T> = FindOneOptions<T>>(entityClass: EntityTarget<T>, options: K): Promise<T> {
    return findOneOrFail(entityClass, options, this.manager);
  }

  async findOrInsert<T extends ObjectLiteral, K extends DeepPartial<T> = DeepPartial<T>>(entityClass: EntityTarget<T>, entity: K): Promise<T> {
    return findOrInsert(entityClass, entity);
  }

  async findAndDelete<T extends ObjectLiteral, D extends FindConditions<T> = FindConditions<T>>(entityClass: EntityTarget<T>, criteria: FindConditions<T>): Promise<T> {
    return findAndDelete(entityClass, criteria, this.manager);
  }
}

export const getRepository = <T extends ObjectLiteral>(entityClass: EntityTarget<T>, manager?: EntityManager) => manager ? manager.getRepository(entityClass) : _getRepository(entityClass);
export const insert = async <T extends ObjectLiteral, K extends DeepPartial<T> = DeepPartial<T>>(entityClass: EntityTarget<T>, entity: K, manager?: EntityManager): Promise<T> => {
  const repository = getRepository(entityClass, manager);
  const results = await repository.insert(entity);

  return repository.merge(
    repository.create(),
    results.generatedMaps[0] as DeepPartial<T>,
    entity
  );
}

export const save = async <T extends ObjectLiteral, K extends DeepPartial<T> = DeepPartial<T>>(entityClass: EntityTarget<T>, entity: K, manager?: EntityManager): Promise<T> => {
  return getRepository(entityClass, manager).save(entity);
};

export const remove = async <T extends ObjectLiteral, C extends DeleteCriteria<T> = DeleteCriteria<T>>(entityClass: EntityTarget<T>, criteria: C, manager?:EntityManager): Promise<number> => {
  const result = await getRepository(entityClass, manager).delete(criteria);
  return result.affected || 0;
}

export const upsert = async <T extends BaseEntity>(entityClass: EntityTarget<T>, data: DeepPartial<T>, manager?: EntityManager) => {
  if(data.id) {
    return save(entityClass, data, manager);
  }

  return insert(entityClass, data, manager);
}

export const delsert = async <T extends BaseEntity, D extends DeepPartial<T> = DeepPartial<T>>(entityClass: EntityTarget<T>, criteria: DeleteCriteria<T>, data: D, manager?: EntityManager): Promise<T> => {
  await remove(entityClass, criteria, manager);
  return await insert(entityClass, data, manager);
}

export const findOne = async <T extends ObjectLiteral, K = FindOneOptions<T>>(entityClass: EntityTarget<T>, options: K, manager?: EntityManager): Promise<T | undefined> => getRepository(entityClass, manager).findOne(options);
export const findOneOrFail = async <T extends ObjectLiteral, K extends FindOneOptions<T> = FindOneOptions<T>>(entityClass: EntityTarget<T>, options: K, manager?:EntityManager): Promise<T> => getRepository(entityClass, manager).findOneOrFail(options);
export const findOrInsert = async <T extends ObjectLiteral, K extends DeepPartial<T> = DeepPartial<T>>(entityClass: EntityTarget<T>, entity: K, manager?:EntityManager) => {
  let data = await findOne(entityClass, entity, manager);

  if(!data) {
    data = await insert(entityClass, entity, manager);
  }

  return data;
}
export const findAndDelete = async <T extends ObjectLiteral, D extends FindConditions<T> = FindConditions<T>>(entityClass: EntityTarget<T>, criteria: FindConditions<T>, manager?: EntityManager): Promise<T> => {
  const entity = await findOneOrFail(entityClass, criteria, manager);
  await remove(entityClass, criteria, manager);
  return entity;
}
