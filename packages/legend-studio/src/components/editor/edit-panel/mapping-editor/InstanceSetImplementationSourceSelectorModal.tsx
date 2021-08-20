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

import { useRef } from 'react';
import { observer } from 'mobx-react-lite';
import type { SelectComponent } from '@finos/legend-application-components';
import {
  CustomSelectorInput,
  createFilter,
} from '@finos/legend-application-components';
import type {
  MappingEditorState,
  MappingElementSource,
} from '../../../../stores/editor-state/element-editor-state/mapping/MappingEditorState';
import { getMappingElementSource } from '../../../../stores/editor-state/element-editor-state/mapping/MappingEditorState';
import Dialog from '@material-ui/core/Dialog';
import type { InstanceSetImplementation } from '@finos/legend-graph';
import {
  Class,
  RootFlatDataRecordType,
  View,
  Table,
  DEFAULT_DATABASE_SCHEMA_NAME,
} from '@finos/legend-graph';
import { UnsupportedOperationError } from '@finos/legend-shared';
import { flowResult } from 'mobx';
import { buildElementOption } from '../../../../stores/shared/PackageableElementOptionUtil';
import { useEditorStore } from '../../EditorStoreProvider';
import { useApplicationStore } from '../../../application/ApplicationStoreProvider';

/* @MARKER: NEW CLASS MAPPING TYPE SUPPORT --- consider adding class mapping type handler here whenever support for a new one is added to the app */
export const getMappingElementSourceFilterText = (
  option: MappingElementSourceSelectOption,
): string => {
  const val = option.value;
  if (val instanceof Class) {
    return val.path;
  } else if (val instanceof RootFlatDataRecordType) {
    return val.owner.name;
  } else if (val instanceof Table || val instanceof View) {
    return `${val.schema.owner.path}.${val.schema.name}.${val.name}`;
  }
  throw new UnsupportedOperationError();
};

export interface MappingElementSourceSelectOption {
  label: string;
  value: MappingElementSource;
}

/* @MARKER: NEW CLASS MAPPING TYPE SUPPORT --- consider adding class mapping type handler here whenever support for a new one is added to the app */
export const getSourceElementLabel = (
  srcElement: MappingElementSource | undefined,
): string => {
  let sourceLabel = '(none)';
  if (srcElement instanceof Class) {
    sourceLabel = srcElement.name;
  } else if (srcElement instanceof RootFlatDataRecordType) {
    sourceLabel = srcElement.owner.name;
  } else if (srcElement instanceof Table || srcElement instanceof View) {
    sourceLabel = `${srcElement.schema.owner.name}.${
      srcElement.schema.name === DEFAULT_DATABASE_SCHEMA_NAME
        ? ''
        : `${srcElement.schema.name}.`
    }${srcElement.name}`;
  }
  return sourceLabel;
};

/* @MARKER: NEW CLASS MAPPING TYPE SUPPORT --- consider adding class mapping type handler here whenever support for a new one is added to the app */
// TODO: add more visual cue to the type of source (class vs. flat-data vs. db)
export const buildMappingElementSourceOption = (
  source: MappingElementSource | undefined,
): MappingElementSourceSelectOption | null => {
  if (source instanceof Class) {
    return buildElementOption(source) as MappingElementSourceSelectOption;
  } else if (source instanceof RootFlatDataRecordType) {
    return {
      label: `${source.owner.owner.name}.${source.owner.name}`,
      value: source,
    };
  } else if (source instanceof Table || source instanceof View) {
    return {
      label: `${source.schema.owner.name}.${
        source.schema.name === DEFAULT_DATABASE_SCHEMA_NAME
          ? ''
          : `${source.schema.name}.`
      }${source.name}`,
      value: source,
    };
  }
  return null;
};

export const InstanceSetImplementationSourceSelectorModal = observer(
  (props: {
    mappingEditorState: MappingEditorState;
    setImplementation: InstanceSetImplementation;
    /**
     * Pass in `null` when we want to open the modal using the existing source.
     * Pass any other to open the source modal using that value as the initial state of the modal.
     */
    sourceElementToSelect: MappingElementSource | null;
    closeModal: () => void;
  }) => {
    const {
      mappingEditorState,
      setImplementation,
      closeModal,
      sourceElementToSelect,
    } = props;
    const editorStore = useEditorStore();
    const applicationStore = useApplicationStore();
    /* @MARKER: NEW CLASS MAPPING TYPE SUPPORT --- consider adding class mapping type handler here whenever support for a new one is added to the app */
    const options = (
      editorStore.graphState.graph.ownClasses as MappingElementSource[]
    )
      .concat(
        editorStore.graphState.graph.ownFlatDatas.flatMap((e) => e.recordTypes),
      )
      .concat(
        editorStore.graphState.graph.ownDatabases.flatMap((e) =>
          e.schemas.flatMap((schema) =>
            (schema.tables as (Table | View)[]).concat(schema.views),
          ),
        ),
      )
      .map(buildMappingElementSourceOption);
    const filterOption = createFilter({
      ignoreCase: true,
      ignoreAccents: false,
      stringify: getMappingElementSourceFilterText,
    });
    const sourceSelectorRef = useRef<SelectComponent>(null);
    const selectedSourceType = buildMappingElementSourceOption(
      sourceElementToSelect ?? getMappingElementSource(setImplementation),
    );
    const changeSourceType = (
      val: MappingElementSourceSelectOption | null,
    ): Promise<void> =>
      flowResult(
        mappingEditorState.changeClassMappingSourceDriver(
          setImplementation,
          val?.value,
        ),
      )
        .then(() => closeModal())
        .catch(applicationStore.alertIllegalUnhandledError);
    const handleEnter = (): void => sourceSelectorRef.current?.focus();

    return (
      <Dialog
        open={true}
        onClose={closeModal}
        TransitionProps={{
          onEnter: handleEnter,
        }}
        classes={{
          container: 'search-modal__container',
        }}
        PaperProps={{
          classes: {
            root: 'search-modal__inner-container',
          },
        }}
      >
        <div className="modal search-modal">
          <div className="modal__title">Choose a Source</div>
          <CustomSelectorInput
            ref={sourceSelectorRef}
            options={options}
            onChange={changeSourceType}
            value={selectedSourceType}
            placeholder={`Select a source...`}
            isClearable={true}
            filterOption={filterOption}
          />
        </div>
      </Dialog>
    );
  },
);
