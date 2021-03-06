// Copyright 2019 The Oppia Authors. All Rights Reserved.
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
 * @fileoverview Directive for the skill mastery viewer.
 */

require('domain/skill/SkillMasteryBackendApiService.ts');

angular.module('oppia').directive('skillMasteryViewer', [
  'UrlInterpolationService', function(UrlInterpolationService) {
    return {
      restrict: 'E',
      scope: {},
      bindToController: {
        skillId: '=',
        masteryChange: '='
      },
      templateUrl: UrlInterpolationService.getDirectiveTemplateUrl(
        '/components/skill-mastery/skill-mastery.directive.html'),
      controllerAs: '$ctrl',
      controller: [
        '$scope', 'SkillMasteryBackendApiService',
        function(
            $scope, SkillMasteryBackendApiService) {
          var ctrl = this;
          ctrl.skillMasteryDegree = 0.0;

          SkillMasteryBackendApiService.fetchSkillMasteryDegrees(
            [ctrl.skillId]).then(function(degreesOfMastery) {
            ctrl.skillMasteryDegree = degreesOfMastery[ctrl.skillId];
          });

          ctrl.getSkillMasteryPercentage = function() {
            return Math.round(ctrl.skillMasteryDegree * 100);
          };

          ctrl.getLearningTips = function() {
            // TODO(sophiewu6): Implement learning tips feature.
          };
        }
      ]
    };
  }]);
