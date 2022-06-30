import {getRepository as _getRepository, EntityTarget, DeepPartial, EntityManager, ObjectLiteral} from "typeorm";
import {ObjectID} from "typeorm/driver/mongodb/typings";
import {FindConditions} from "typeorm/find-options/FindConditions";
import {FindOneOptions} from "typeorm/find-options/FindOneOptions";
import {BaseModel} from "../models/BaseModel";

type DeleteCriteria<T> = string | string[] | number | number[] | Date | Date[] | ObjectID | ObjectID[] | FindConditions<T>;

export const getRepository = <T extends ObjectLiteral>(entityClass: EntityTarget<T>, manager?: EntityManager) => manager ? manager.getRepository(entityClass) : _getRepository(entityClass);
export const insert = async <T extends ObjectLiteral, K extends DeepPartial<T> = DeepPartial<T>>(entityClass: EntityTarget<T>, entity: K, manager?: EntityManager): Promise<T> => {
  const repository = getRepository(entityClass, manager);
  const { generatedMaps } = await repository.insert(entity);

  if(generatedMaps.length < 0) {
    throw new Error('No results returned from insert!');
  }

  return repository.merge(
    repository.create(),
    generatedMaps[0] as DeepPartial<T>,
    entity
  );
}

export const save = async <T extends ObjectLiteral, K extends DeepPartial<T> = DeepPartial<T>>(entityClass: EntityTarget<T>, entity: K, manager?: EntityManager): Promise<T> => {
  if(!entity['id']) {
    throw new Error('Cannot update entity without an id');
  }

  return getRepository(entityClass, manager).save(entity);
};

export const remove = async <T extends ObjectLiteral, C extends DeleteCriteria<T> = DeleteCriteria<T>>(entityClass: EntityTarget<T>, criteria: C, manager?:EntityManager): Promise<number> => {
  const result = await getRepository(entityClass, manager).delete(criteria);
  return result.affected || 0;
}

export const upsert = async <T extends BaseModel>(entityClass: EntityTarget<T>, data: DeepPartial<T>, manager?: EntityManager) => {
  if(data.id) {
    return save(entityClass, data, manager);
  }

  return insert(entityClass, data, manager);
}

export const remsert = async <T extends BaseModel, D extends DeepPartial<T> = DeepPartial<T>>(entityClass: EntityTarget<T>, criteria: DeleteCriteria<T>, data: D, manager?: EntityManager): Promise<T> => {
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
