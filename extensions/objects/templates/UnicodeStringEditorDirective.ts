// Copyright 2014 The Oppia Authors. All Rights Reserved.
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
 * @fileoverview Directive for unicode string editor.
 */

// Every editor directive should implement an alwaysEditable option. There
// may be additional customization options for the editor that should be passed
// in via initArgs.

angular.module('oppia').directive('unicodeStringEditor', [
  'UrlInterpolationService',
  function(UrlInterpolationService) {
    return {
      restrict: 'E',
      scope: {},
      bindToController: {
        getAlwaysEditable: '&',
        getInitArgs: '&',
        value: '='
      },
      templateUrl: UrlInterpolationService.getExtensionResourceUrl(
        '/objects/templates/unicode_string_editor_directive.html'),
      controllerAs: '$ctrl',
      controller: ['$scope', function($scope) {
        var ctrl = this;
        ctrl.alwaysEditable = ctrl.getAlwaysEditable();
        ctrl.initArgs = ctrl.getInitArgs();
        ctrl.largeInput = false;

        $scope.$watch('$ctrl.initArgs', function(newValue) {
          ctrl.largeInput = false;
          if (newValue && newValue.largeInput) {
            ctrl.largeInput = newValue.largeInput;
          }
        });

        // Reset the component each time the value changes (e.g. if this is part
        // of an editable list).
        $scope.$watch('$ctrl.value', function() {
          ctrl.localValue = {
            label: ctrl.value || ''
          };
        }, true);

        if (ctrl.alwaysEditable) {
          $scope.$watch('$ctrl.localValue.label', function(newValue) {
            ctrl.value = newValue;
          });
        } else {
          ctrl.openEditor = function() {
            ctrl.active = true;
          };

          ctrl.closeEditor = function() {
            ctrl.active = false;
          };

          ctrl.replaceValue = function(newValue) {
            ctrl.localValue = {
              label: newValue
            };
            ctrl.value = newValue;
            ctrl.closeEditor();
          };

          $scope.$on('externalSave', function() {
            if (ctrl.active) {
              ctrl.replaceValue(ctrl.localValue.label);
              // The $scope.$apply() call is needed to propagate the replaced
              // value.
              $scope.$apply();
            }
          });

          ctrl.closeEditor();
        }
      }]
    };
  }]);
