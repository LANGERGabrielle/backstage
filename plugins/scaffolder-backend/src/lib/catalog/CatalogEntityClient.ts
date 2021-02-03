/*
 * Copyright 2020 Spotify AB
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

import { TemplateEntityV1alpha1 } from '@backstage/catalog-model';
import { ApiContext, CatalogClient } from '@backstage/catalog-client';
import {
  ConflictError,
  NotFoundError,
  PluginEndpointDiscovery,
} from '@backstage/backend-common';

/**
 * A catalog client tailored for reading out entity data from the catalog.
 */
export class CatalogEntityClient {
  private readonly catalogClient: CatalogClient;

  constructor(options: { discovery: PluginEndpointDiscovery }) {
    this.catalogClient = new CatalogClient({
      discoveryApi: options.discovery,
    });
  }

  /**
   * Looks up a single template using a template name.
   *
   * Throws a NotFoundError or ConflictError if 0 or multiple templates are found.
   */
  async findTemplate(
    templateName: string,
    context?: ApiContext,
  ): Promise<TemplateEntityV1alpha1> {
    const { items: templates } = (await this.catalogClient.getEntities(
      {
        filter: {
          kind: 'template',
          'metadata.name': templateName,
        },
      },
      context,
    )) as { items: TemplateEntityV1alpha1[] };

    if (templates.length !== 1) {
      if (templates.length > 1) {
        throw new ConflictError(
          'Templates lookup resulted in multiple matches',
        );
      } else {
        throw new NotFoundError('Template not found');
      }
    }

    return templates[0];
  }
}
