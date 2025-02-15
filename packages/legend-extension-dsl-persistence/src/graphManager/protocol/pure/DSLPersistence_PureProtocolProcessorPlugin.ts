/**
 * Copyright (c) 2020-present, Goldman Sachs
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import packageJson from '../../../../package.json';
import { Persistence } from '../../../graph/metamodel/pure/model/packageableElements/persistence/DSLPersistence_Persistence.js';
import { PersistenceContext } from '../../../graph/metamodel/pure/model/packageableElements/persistence/DSLPersistence_PersistenceContext.js';
import { V1_Persistence } from './v1/model/packageableElements/persistence/V1_DSLPersistence_Persistence.js';
import { V1_PersistenceContext } from './v1/model/packageableElements/persistence/V1_DSLPersistence_PersistenceContext.js';
import {
  V1_PERSISTENCE_ELEMENT_PROTOCOL_TYPE,
  V1_persistenceModelSchema,
} from './v1/transformation/pureProtocol/V1_DSLPersistence_ProtocolHelper.js';
import {
  V1_PERSISTENCE_CONTEXT_ELEMENT_PROTOCOL_TYPE,
  V1_persistenceContextModelSchema,
} from './v1/transformation/pureProtocol/V1_DSLPersistenceContext_ProtocolHelper.js';
import { V1_buildPersistence } from './v1/transformation/pureGraph/to/V1_PersistenceBuilder.js';
import { V1_buildPersistenceContext } from './v1/transformation/pureGraph/to/V1_PersistenceContextBuilder.js';
import { V1_transformPersistence } from './v1/transformation/pureGraph/from/V1_PersistenceTransformer.js';
import { V1_transformPersistenceContext } from './v1/transformation/pureGraph/from/V1_PersistenceContextTransformer.js';
import {
  type PackageableElement,
  PureProtocolProcessorPlugin,
  V1_ElementBuilder,
  type V1_ElementProtocolClassifierPathGetter,
  type V1_ElementProtocolDeserializer,
  type V1_ElementProtocolSerializer,
  type V1_ElementTransformer,
  type V1_GraphBuilderContext,
  type V1_GraphTransformerContext,
  type V1_PackageableElement,
  V1_buildFullPath,
} from '@finos/legend-graph';
import { assertType, type PlainObject } from '@finos/legend-shared';
import { deserialize, serialize } from 'serializr';

export const PERSISTENCE_ELEMENT_CLASSIFIER_PATH =
  'meta::pure::persistence::metamodel::Persistence';

export const PERSISTENCE_CONTEXT_ELEMENT_CLASSIFIER_PATH =
  'meta::pure::persistence::metamodel::PersistenceContext';

export class DSLPersistence_PureProtocolProcessorPlugin extends PureProtocolProcessorPlugin {
  constructor() {
    super(
      packageJson.extensions.pureProtocolProcessorPlugin,
      packageJson.version,
    );
  }

  override V1_getExtraElementBuilders(): V1_ElementBuilder<V1_PackageableElement>[] {
    return [
      new V1_ElementBuilder<V1_Persistence>({
        elementClassName: 'Persistence',
        _class: V1_Persistence,
        firstPass: (
          elementProtocol: V1_PackageableElement,
          context: V1_GraphBuilderContext,
        ): PackageableElement => {
          assertType(elementProtocol, V1_Persistence);
          const element = new Persistence(elementProtocol.name);
          const path = V1_buildFullPath(
            elementProtocol.package,
            elementProtocol.name,
          );
          context.currentSubGraph.setOwnElementInExtension(
            path,
            element,
            Persistence,
          );
          return element;
        },
        secondPass: (
          elementProtocol: V1_PackageableElement,
          context: V1_GraphBuilderContext,
        ): void => {
          assertType(elementProtocol, V1_Persistence);
          V1_buildPersistence(elementProtocol, context);
        },
      }),
      new V1_ElementBuilder<V1_PersistenceContext>({
        elementClassName: 'PersistenceContext',
        _class: V1_PersistenceContext,
        firstPass: (
          elementProtocol: V1_PackageableElement,
          context: V1_GraphBuilderContext,
        ): PackageableElement => {
          assertType(elementProtocol, V1_PersistenceContext);
          const element = new PersistenceContext(elementProtocol.name);
          const path = V1_buildFullPath(
            elementProtocol.package,
            elementProtocol.name,
          );
          context.currentSubGraph.setOwnElementInExtension(
            path,
            element,
            PersistenceContext,
          );
          return element;
        },
        secondPass: (
          elementProtocol: V1_PackageableElement,
          context: V1_GraphBuilderContext,
        ): void => {
          assertType(elementProtocol, V1_PersistenceContext);
          V1_buildPersistenceContext(elementProtocol, context);
        },
      }),
    ];
  }

  override V1_getExtraElementClassifierPathGetters(): V1_ElementProtocolClassifierPathGetter[] {
    return [
      (elementProtocol: V1_PackageableElement): string | undefined => {
        if (elementProtocol instanceof V1_Persistence) {
          return PERSISTENCE_ELEMENT_CLASSIFIER_PATH;
        } else if (elementProtocol instanceof V1_PersistenceContext) {
          return PERSISTENCE_CONTEXT_ELEMENT_CLASSIFIER_PATH;
        }
        return undefined;
      },
    ];
  }

  override V1_getExtraElementProtocolSerializers(): V1_ElementProtocolSerializer[] {
    return [
      (
        elementProtocol: V1_PackageableElement,
        plugins: PureProtocolProcessorPlugin[],
      ): PlainObject<V1_PackageableElement> | undefined => {
        if (elementProtocol instanceof V1_Persistence) {
          return serialize(V1_persistenceModelSchema(plugins), elementProtocol);
        } else if (elementProtocol instanceof V1_PersistenceContext) {
          return serialize(
            V1_persistenceContextModelSchema(plugins),
            elementProtocol,
          );
        }
        return undefined;
      },
    ];
  }

  override V1_getExtraElementProtocolDeserializers(): V1_ElementProtocolDeserializer[] {
    return [
      (
        json: PlainObject<V1_PackageableElement>,
        plugins: PureProtocolProcessorPlugin[],
      ): V1_PackageableElement | undefined => {
        if (json._type === V1_PERSISTENCE_ELEMENT_PROTOCOL_TYPE) {
          return deserialize(V1_persistenceModelSchema(plugins), json);
        } else if (
          json._type === V1_PERSISTENCE_CONTEXT_ELEMENT_PROTOCOL_TYPE
        ) {
          return deserialize(V1_persistenceContextModelSchema(plugins), json);
        }
        return undefined;
      },
    ];
  }

  override V1_getExtraElementTransformers(): V1_ElementTransformer[] {
    return [
      (
        metamodel: PackageableElement,
        context: V1_GraphTransformerContext,
      ): V1_PackageableElement | undefined => {
        if (metamodel instanceof Persistence) {
          return V1_transformPersistence(metamodel, context);
        } else if (metamodel instanceof PersistenceContext) {
          return V1_transformPersistenceContext(metamodel, context);
        }
        return undefined;
      },
    ];
  }
}
