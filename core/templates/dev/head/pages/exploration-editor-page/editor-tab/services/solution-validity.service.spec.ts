// Copyright 2017 The Oppia Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Unit tests for Solution Validity Service.
 */

/* eslint-disable max-len */
import { SolutionValidityService } from
  'pages/exploration-editor-page/editor-tab/services/solution-validity.service.ts';
/* eslint-enable max-len */

describe('Solution Validity Service', function() {
  describe('SolutionValidityService', function() {
    let svs: SolutionValidityService;

    beforeEach(() => {
      svs = new SolutionValidityService();
    });

    it('should store validity of the solution correctly',
      function() {
        // Initialize SolutionValidityService.
        svs.init(['State 1']);

        svs.updateValidity('State 1', true);
        expect(svs.isSolutionValid('State 1')).toBe(true);

        svs.deleteSolutionValidity('State 1');
        expect(Object.keys(svs.getAllValidities())).toEqual([]);

        svs.updateValidity('State 1', false);
        expect(svs.isSolutionValid('State 1')).toBe(false);
      });
  });
});
