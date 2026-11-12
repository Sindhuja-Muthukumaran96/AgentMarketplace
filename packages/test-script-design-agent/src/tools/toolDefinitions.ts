import type { ToolDefinition } from '@agent-marketplace/agent-core';

export const TOOL_NAMES = {
  LIST_PAGE_OBJECTS: 'list_page_objects',
  GET_PAGE_OBJECT_SOURCE: 'get_page_object_source',
  GET_FIXTURE_SOURCE: 'get_fixture_source',
  GET_TEST_DATA_UTIL_SOURCE: 'get_test_data_util_source',
  WRITE_TEST_FILE: 'write_test_file'
} as const;

/**
 * Tool (function-calling) definitions exposed to the LLM. These force the model
 * to ground its output in the *target repository's real artifacts* instead of
 * hallucinating locators or fixtures, and to produce its final answer through a
 * structured `write_test_file` call rather than free-form text.
 */
export const toolDefinitions: ToolDefinition[] = [
  {
    type: 'function',
    function: {
      name: TOOL_NAMES.LIST_PAGE_OBJECTS,
      description:
        'List every existing Page Object class available in the target repository, including ' +
        'their public method signatures. Always call this before writing any test code so you ' +
        'reuse existing methods instead of inventing new locators.',
      parameters: { type: 'object', properties: {}, required: [] }
    }
  },
  {
    type: 'function',
    function: {
      name: TOOL_NAMES.GET_PAGE_OBJECT_SOURCE,
      description: 'Get the full TypeScript source of one existing Page Object by class name.',
      parameters: {
        type: 'object',
        properties: {
          pageObjectName: { type: 'string', description: 'Class name of the page object, e.g. "LoginPage".' }
        },
        required: ['pageObjectName']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: TOOL_NAMES.GET_FIXTURE_SOURCE,
      description: 'Get the full source of the target repository\'s test fixtures file, listing which fixtures are available to tests.',
      parameters: { type: 'object', properties: {}, required: [] }
    }
  },
  {
    type: 'function',
    function: {
      name: TOOL_NAMES.GET_TEST_DATA_UTIL_SOURCE,
      description: 'Get the full source of the target repository\'s test-data factory/utility to reuse existing deterministic test data.',
      parameters: { type: 'object', properties: {}, required: [] }
    }
  },
  {
    type: 'function',
    function: {
      name: TOOL_NAMES.WRITE_TEST_FILE,
      description:
        'Persist the final, complete test spec to disk in the target repository. Call this exactly ' +
        'once you are confident the code follows every retrieved coding standard. This is the only ' +
        'way to produce a usable result — plain text answers are ignored.',
      parameters: {
        type: 'object',
        properties: {
          fileName: { type: 'string', description: 'kebab-case file name without extension, e.g. "remove-item-from-cart".' },
          testCode: { type: 'string', description: 'The complete, final contents of the test spec file.' },
          summary: { type: 'string', description: 'One sentence describing what the generated test verifies.' }
        },
        required: ['fileName', 'testCode', 'summary']
      }
    }
  }
];
