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

import {
  type QueryBuilderMode,
  StandardQueryBuilderMode,
  QueryBuilderState,
} from '@finos/legend-application-query';
import type { GeneratorFn } from '@finos/legend-shared';
import {
  type EditorStore,
  EditorExtensionState,
} from '@finos/legend-application-studio';
import { action, flow, flowResult, makeObservable, observable } from 'mobx';

interface EmbeddedQueryBuilderMode {
  queryBuilderMode: QueryBuilderMode;
  disableCompile?: boolean | undefined;
  actionConfigs: {
    key: string;
    renderer: () => React.ReactNode;
  }[];
}

export class QueryBuilder_EditorExtensionState extends EditorExtensionState {
  editorStore: EditorStore;
  queryBuilderState: QueryBuilderState;
  mode?: EmbeddedQueryBuilderMode | undefined;

  constructor(editorStore: EditorStore) {
    super();

    makeObservable(this, {
      queryBuilderState: observable,
      mode: observable.ref,
      reset: action,
      setEmbeddedQueryBuilderMode: flow,
    });

    this.editorStore = editorStore;
    this.queryBuilderState = new QueryBuilderState(
      editorStore.applicationStore,
      editorStore.graphManagerState,
      new StandardQueryBuilderMode(),
    );
  }

  reset(): void {
    this.queryBuilderState = new QueryBuilderState(
      this.editorStore.applicationStore,
      this.editorStore.graphManagerState,
      this.queryBuilderState.mode,
    );
  }

  /**
   * When opening query builder, we ensure the graph compiles successfully
   */
  *setEmbeddedQueryBuilderMode(
    mode: EmbeddedQueryBuilderMode | undefined,
  ): GeneratorFn<void> {
    if (!this.editorStore.isInFormMode) {
      return;
    }
    if (mode) {
      this.queryBuilderState.setMode(mode.queryBuilderMode);
      if (!mode.disableCompile) {
        this.editorStore.setBlockingAlert({
          message: 'Compiling graph before building query...',
          showLoading: true,
        });
        yield flowResult(
          this.editorStore.graphState.globalCompileInFormMode({
            disableNotificationOnSuccess: true,
          }),
        );
        this.editorStore.setBlockingAlert(undefined);
      }
      if (!this.editorStore.graphState.hasCompilationError) {
        this.mode = mode;
      }
      this.editorStore.setBlockGlobalHotkeys(true);
      this.editorStore.setHotkeys([]);
    } else {
      this.mode = undefined;
      this.editorStore.setBlockGlobalHotkeys(false);
      this.editorStore.resetHotkeys();
    }
  }
}
