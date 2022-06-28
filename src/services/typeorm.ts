import {getRepository, EntityTarget, DeepPartial, EntityManager} from "typeorm";
import {QueryDeepPartialEntity} from "typeorm/query-builder/QueryPartialEntity";
import {ObjectID} from "typeorm/driver/mongodb/typings";
import {FindConditions} from "typeorm/find-options/FindConditions";
import {FindOneOptions} from "typeorm/find-options/FindOneOptions";
import {BaseModel} from "../models/BaseModel";

type DeleteCriteria<T> = string | string[] | number | number[] | Date | Date[] | ObjectID | ObjectID[] | FindConditions<T>;

export const insert = async <T extends BaseModel>(entityClass: EntityTarget<T>, entity: QueryDeepPartialEntity<T>, manager?: EntityManager): Promise<T> => {
  const repository = manager ? manager.getRepository(entityClass) : getRepository(entityClass);
  const { generatedMaps } = await repository.insert(entity);

  if(generatedMaps.length < 0) {
    throw new Error('No results returned from insert!');
  }


  return repository.merge(
    repository.create(),
    generatedMaps[0] as DeepPartial<T>,
    entity as DeepPartial<T>
  );
}

export const save = async <T extends BaseModel>(entityClass: EntityTarget<T>, entity: DeepPartial<T>, manager?: EntityManager): Promise<T> => {
  const repository = manager ? manager.getRepository(entityClass) : getRepository(entityClass);

  if(!entity.id) {
    throw new Error('Cannot update entity without an id');
  }

  return repository.save(entity);
};

export const remove = async <T extends BaseModel>(entityClass: EntityTarget<T>, criteria: DeleteCriteria<T>, manager?:EntityManager): Promise<number> => {
  const repository = manager ? manager.getRepository(entityClass) : getRepository(entityClass);
  const result = await repository.delete(criteria); 
  return result.affected || 0;
}

export const upsert = async <T extends BaseModel>(entityClass: EntityTarget<T>, data: DeepPartial<T>, manager?: EntityManager) => {
  if(data.id) {
    return save(entityClass, data, manager);
  }

  return insert(entityClass, data as QueryDeepPartialEntity<T>, manager);
}

export const remsert = async <T extends BaseModel>(entityClass: EntityTarget<T>, criteria: DeleteCriteria<T>, data: QueryDeepPartialEntity<T>, manager?: EntityManager): Promise<T> => {
  await remove(entityClass, criteria, manager);
  return await insert(entityClass, data, manager);
}

export const findOne = async <T extends BaseModel>(entityClass: EntityTarget<T>, options: FindOneOptions<T>): Promise<T | undefined> => getRepository(entityClass).findOne(options);
export const findOneOrFail = async <T extends BaseModel>(entityClass: EntityTarget<T>, options: FindOneOptions<T>): Promise<T> => getRepository(entityClass).findOneOrFail(options);
