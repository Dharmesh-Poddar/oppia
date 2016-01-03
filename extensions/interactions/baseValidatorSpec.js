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
 * @fileoverview Unit tests for all interaction validators.
 *
 * NOTE TO DEVELOPERS: Many of the exploration validators simply defer their
 * validation to the baseValidator. As a result, they require no additional
 * testing. You will see some test suites in this file which simply have a
 * single test for the validator along the lines of "it should be able to
 * perform basic validation." These simple tests are to ensure the policy of the
 * validator is to defer validation to the baseValidator, since it has its own
 * tests to ensure it is working properly.
 *
 * @author bhenning@google.com (Ben Henning)
 */

describe('Interaction validator', function() {
  var scope, filter, bivs, WARNING_TYPES;

  var currentState, otherState, goodOutcomeDest, goodOutcomeFeedback;
  var badOutcome, goodAnswerGroups, goodDefaultOutcome;

  var createAnswerGroup = function(outcome, ruleSpecs) {
    if (!ruleSpecs) {
      ruleSpecs = [];
    }
    return {
      rule_specs: ruleSpecs,
      outcome: outcome
    };
  };

  beforeEach(function() {
    module('oppia');
  });

  beforeEach(inject(function($rootScope, $controller, $injector) {
    scope = $rootScope.$new();
    filter = $injector.get('$filter');
    bivs = $injector.get('baseInteractionValidationService');
    WARNING_TYPES = $injector.get('WARNING_TYPES');

    currentState = 'First State';
    otherState = 'Second State';
    goodOutcomeDest = {
      dest: otherState,
      feedback: []
    };
    goodOutcomeFeedback = {
      dest: currentState,
      feedback: ['Feedback']
    };
    badOutcome = {
      dest: currentState,
      feedback: []
    };

    goodAnswerGroups = [
      createAnswerGroup(goodOutcomeDest), createAnswerGroup(goodOutcomeFeedback)
    ];
    goodDefaultOutcome = goodOutcomeDest;
  }));

  describe('baseValidator', function() {
    it('should have no warnings for good answer groups with no ' +
        'confusing outcomes', function() {
      var warnings = bivs.getAnswerGroupWarnings(
        goodAnswerGroups, currentState);
      expect(warnings).toEqual([]);
    });

    it('should have a warning for an answer group with a confusing outcome',
        function() {
      var answerGroups = [
        createAnswerGroup(goodOutcomeDest),
        createAnswerGroup(badOutcome),
        createAnswerGroup(goodOutcomeFeedback)
      ];
      var warnings = bivs.getAnswerGroupWarnings(answerGroups, currentState);
      expect(warnings).toEqual([{
        type: WARNING_TYPES.ERROR,
        message: 'Please specify what Oppia should do in answer group 2.'
      }]);
    });

    it('should not have any warnings for a non-confusing default outcome',
        function() {
      var warnings = bivs.getDefaultOutcomeWarnings(
        goodOutcomeDest, currentState);
      expect(warnings).toEqual([]);

      warnings = bivs.getDefaultOutcomeWarnings(
        goodOutcomeFeedback, currentState);
      expect(warnings).toEqual([]);
    });

    it('should have a warning for a confusing default outcome', function() {
      var warnings = bivs.getDefaultOutcomeWarnings(badOutcome, currentState);
      expect(warnings).toEqual([{
        type: WARNING_TYPES.ERROR,
        message: 'Please add feedback for the user if they are to return ' +
          'to the same state again.'
      }]);
    });

    it('should not have any warnings for no answer groups and a null default ' +
        'outcome.', function() {
      var warnings = bivs.getAllOutcomeWarnings([], null, currentState);
      expect(warnings).toEqual([]);
    });

    it('should be able to concatenate warnings for both answer groups and ' +
        'the default outcome', function() {
      var badAnswerGroups = [
        createAnswerGroup(goodOutcomeDest),
        createAnswerGroup(badOutcome),
        createAnswerGroup(badOutcome)
      ];
      var warnings = bivs.getAllOutcomeWarnings(
        badAnswerGroups, badOutcome, currentState);
      expect(warnings).toEqual([{
          type: WARNING_TYPES.ERROR,
          message: 'Please specify what Oppia should do in answer group 2.'
        }, {
          type: WARNING_TYPES.ERROR,
          message: 'Please specify what Oppia should do in answer group 3.'
        }, {
          type: WARNING_TYPES.ERROR,
          message: (
            'Please add feedback for the user if they are to return ' +
            'to the same state again.')
        }
      ]);
    });
  });

  describe('customizationValidator', function() {
    it('should not throw for no arguments', function() {
      bivs.requireCustomizationArguments({}, []);
    });

    it('should throw a warning for a missing top-level field', function() {
      expect(function() {
        bivs.requireCustomizationArguments({}, ['levelone']);
      }).toThrow('Expected customization arguments to have property: levelone');
    });

    it('should throw warnings for multiple missing top-level fields',
        function() {
      var expectedArgs = ['first', 'second'];
      expect(function() {
        bivs.requireCustomizationArguments({}, expectedArgs);
      }).toThrow(
        'Expected customization arguments to have properties: first, second');
    });
  });

  describe('oppiaInteractiveItemSelectionInputValidator', function() {
    var validator, customizationArguments;

    beforeEach(function() {
      validator = filter('oppiaInteractiveItemSelectionInputValidator');
      customizationArguments = {
        choices: {
          value: ['Selection 1', 'Selection 2', 'Selection 3']
        },
        maxAllowableSelectionCount: {
          value: 2
        },
        minAllowableSelectionCount: {
          value: 1
        }
      };
      goodAnswerGroups = [
        createAnswerGroup(goodOutcomeDest, [{
          rule_type: 'Equals',
          inputs: {
            x: ['Selection 1', 'Selection 2']
          }
        }])
      ];
    });

    it('should be able to perform basic validation', function() {
      var warnings = validator(
        currentState, customizationArguments, goodAnswerGroups,
        goodDefaultOutcome);
      expect(warnings).toEqual([]);
    });

    it('should expect a choices customization argument', function() {
      expect(function() {
        validator(currentState, {}, goodAnswerGroups, goodDefaultOutcome);
      }).toThrow('Expected customization arguments to have property: choices');
    });

    it('should expect the minAllowableSelectionCount to be less than or ' +
        'equal to maxAllowableSelectionCount', function() {
      customizationArguments.minAllowableSelectionCount.value = 3;

      var warnings = validator(
        currentState, customizationArguments, goodAnswerGroups,
        goodDefaultOutcome);
      expect(warnings).toEqual([{
        type: WARNING_TYPES.CRITICAL,
        message: (
          'Please ensure that the max allowed count is not less than the ' +
          'min count.')
      }]);
    });

    it('should expect maxAllowableSelectionCount to be less than the total ' +
       'number of selections', function() {
      customizationArguments.maxAllowableSelectionCount.value = 3;

      // Remove the last choice.
      customizationArguments.choices.value.splice(2, 1);

      var warnings = validator(
        currentState, customizationArguments, goodAnswerGroups,
        goodDefaultOutcome);
      expect(warnings).toEqual([{
        type: WARNING_TYPES.CRITICAL,
        message: (
          'Please ensure that you have enough choices to reach the max count.')
      }]);
    });

    it('should expect minAllowableSelectionCount to be less than the total ' +
       'number of selections', function() {
      // Remove the last choice.
      customizationArguments.choices.value.splice(2, 1);

      customizationArguments.minAllowableSelectionCount.value = 3;
      customizationArguments.maxAllowableSelectionCount.value = 3;

      var warnings = validator(
        currentState, customizationArguments, goodAnswerGroups,
        goodDefaultOutcome);
      expect(warnings).toEqual([{
        type: WARNING_TYPES.CRITICAL,
        message: (
          'Please ensure that you have enough choices to reach the min count.')
      }]);
    });

    it('should expect all choices to be nonempty', function() {
      // Set the first choice to empty.
      customizationArguments.choices.value[0] = '';

      var warnings = validator(
        currentState, customizationArguments, goodAnswerGroups,
        goodDefaultOutcome);
      expect(warnings).toEqual([{
        type: WARNING_TYPES.CRITICAL,
        message: 'Please ensure the choices are nonempty.'
      }]);
    });

    it('should expect all choices to be unique', function() {
      // Repeat the last choice.
      customizationArguments.choices.value.push('Selection 3');

      var warnings = validator(
        currentState, customizationArguments, goodAnswerGroups,
        goodDefaultOutcome);
      expect(warnings).toEqual([{
        type: WARNING_TYPES.CRITICAL,
        message: 'Please ensure the choices are unique.'
      }]);
    });
  });

  describe('oppiaInteractiveLogicProofValidator', function() {
    var validator;

    beforeEach(function() {
      validator = filter('oppiaInteractiveLogicProofValidator');
    });

    it('should be able to perform basic validation', function() {
      var warnings = validator(
        currentState, {}, goodAnswerGroups, goodDefaultOutcome);
      expect(warnings).toEqual([]);
    });

    it('should not have warnings for a confusing default outcome', function() {
      var warnings = validator(currentState, {}, [], badOutcome);
      expect(warnings).toEqual([]);
    });
  });

  describe('oppiaInteractiveMultipleChoiceInputValidator', function() {
    var validator, customizationArguments;

    beforeEach(function() {
      validator = filter('oppiaInteractiveMultipleChoiceInputValidator');
      customizationArguments = {
        choices: {
          value: ['Option 1', 'Option 2']
        }
      };
      goodAnswerGroups = [createAnswerGroup(goodOutcomeDest, [{
        rule_type: 'Equals',
        inputs: {
          x: 0
        }
      }, {
        rule_type: 'Equals',
        inputs: {
          x: 1
        }
      }])];
    });

    it('should be able to perform basic validation', function() {
      var warnings = validator(
        currentState, customizationArguments, goodAnswerGroups,
        goodDefaultOutcome);
      expect(warnings).toEqual([]);
    });

    it('should expect a choices customization argument', function() {
      expect(function() {
        validator(currentState, {}, goodAnswerGroups, goodDefaultOutcome);
      }).toThrow('Expected customization arguments to have property: choices');
    });

    it('should expect non-empty and unique choices', function() {
      customizationArguments.choices.value[0] = '';
      var warnings = validator(
        currentState, customizationArguments, goodAnswerGroups,
        goodDefaultOutcome);
      expect(warnings).toEqual([{
        type: WARNING_TYPES.CRITICAL,
        message: 'Please ensure the choices are nonempty.'
      }]);

      customizationArguments.choices.value[0] = 'Option 2';
      warnings = validator(
        currentState, customizationArguments, goodAnswerGroups,
        goodDefaultOutcome);
      expect(warnings).toEqual([{
        type: WARNING_TYPES.CRITICAL,
        message: 'Please ensure the choices are unique.'
      }]);
    });

    it('should validate answer group rules refer to valid choices only once',
        function() {
      goodAnswerGroups[0].rule_specs[0].inputs.x = 2;
      var warnings = validator(
        currentState, customizationArguments, goodAnswerGroups,
        goodDefaultOutcome);
      expect(warnings).toEqual([{
        type: WARNING_TYPES.CRITICAL,
        message: 'Please ensure rule 1 in group 1 refers to a valid choice.'
      }]);

      goodAnswerGroups[0].rule_specs[0].inputs.x = 1;
      warnings = validator(
        currentState, customizationArguments, goodAnswerGroups,
        goodDefaultOutcome);
      // Rule 2 will be caught when trying to verify whether any rules are
      // duplicated in their input choice.
      expect(warnings).toEqual([{
        type: WARNING_TYPES.CRITICAL,
        message: (
          'Please ensure rule 2 in group 1 is not equaling the same ' +
          'multiple choice option as another rule.')
      }]);
    });

    it('should expect a non-confusing and non-null default outcome only when ' +
        'not all choices are covered by rules', function() {
      var warnings = validator(
        currentState, customizationArguments, goodAnswerGroups, badOutcome);
      // All of the multiple choice options are targeted by rules, therefore no
      // warning should be issued for a bad default outcome.
      expect(warnings).toEqual([]);

      // Taking away 1 rule reverts back to the expect validation behavior with
      // default outcome.
      goodAnswerGroups[0].rule_specs.splice(1, 1);
      warnings = validator(
        currentState, customizationArguments, goodAnswerGroups, null);
      expect(warnings).toEqual([{
        type: WARNING_TYPES.ERROR,
        message: (
          'Please clarify the default outcome so it is less confusing to ' +
          'the user.')
      }]);
      warnings = validator(
        currentState, customizationArguments, goodAnswerGroups, badOutcome);
      expect(warnings).toEqual([{
        type: WARNING_TYPES.ERROR,
        message: (
          'Please clarify the default outcome so it is less confusing to ' +
          'the user.')
      }]);
    });
  });

  describe('oppiaInteractiveMusicNotesInputValidator', function() {
    var validator;

    beforeEach(function() {
      validator = filter('oppiaInteractiveMusicNotesInputValidator');
    });

    it('should be able to perform basic validation', function() {
      var warnings = validator(
        currentState, {}, goodAnswerGroups, goodDefaultOutcome);
      expect(warnings).toEqual([]);
    });
  });

  describe('oppiaInteractiveNumericInputValidator', function() {
    var validator;

    beforeEach(function() {
      validator = filter('oppiaInteractiveNumericInputValidator');
    });

    it('should be able to perform basic validation', function() {
      var warnings = validator(
        currentState, {}, goodAnswerGroups, goodDefaultOutcome);
      expect(warnings).toEqual([]);
    });
  });

  describe('oppiaInteractiveSetInputValidator', function() {
    var validator;

    beforeEach(function() {
      validator = filter('oppiaInteractiveSetInputValidator');
    });

    it('should be able to perform basic validation', function() {
      var warnings = validator(
        currentState, {}, goodAnswerGroups, goodDefaultOutcome);
      expect(warnings).toEqual([]);
    });
  });

  describe('oppiaInteractiveTextInputValidator', function() {
    var validator;

    beforeEach(function() {
      validator = filter('oppiaInteractiveTextInputValidator');
    });

    it('should be able to perform basic validation', function() {
      var warnings = validator(
        currentState, {}, goodAnswerGroups, goodDefaultOutcome);
      expect(warnings).toEqual([]);
    });
  });
});
