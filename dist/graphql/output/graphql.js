"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterDocument = void 0;
exports.RegisterDocument = {
    kind: "Document",
    definitions: [
        {
            kind: "OperationDefinition",
            operation: "mutation",
            name: { kind: "Name", value: "Register" },
            variableDefinitions: [
                {
                    kind: "VariableDefinition",
                    variable: {
                        kind: "Variable",
                        name: { kind: "Name", value: "username" },
                    },
                    type: {
                        kind: "NonNullType",
                        type: {
                            kind: "NamedType",
                            name: { kind: "Name", value: "String" },
                        },
                    },
                },
                {
                    kind: "VariableDefinition",
                    variable: {
                        kind: "Variable",
                        name: { kind: "Name", value: "password" },
                    },
                    type: {
                        kind: "NonNullType",
                        type: {
                            kind: "NamedType",
                            name: { kind: "Name", value: "String" },
                        },
                    },
                },
            ],
            selectionSet: {
                kind: "SelectionSet",
                selections: [
                    {
                        kind: "Field",
                        name: { kind: "Name", value: "register" },
                        arguments: [
                            {
                                kind: "Argument",
                                name: { kind: "Name", value: "options" },
                                value: {
                                    kind: "ObjectValue",
                                    fields: [
                                        {
                                            kind: "ObjectField",
                                            name: { kind: "Name", value: "username" },
                                            value: {
                                                kind: "Variable",
                                                name: { kind: "Name", value: "username" },
                                            },
                                        },
                                        {
                                            kind: "ObjectField",
                                            name: { kind: "Name", value: "password" },
                                            value: {
                                                kind: "Variable",
                                                name: { kind: "Name", value: "password" },
                                            },
                                        },
                                    ],
                                },
                            },
                        ],
                        selectionSet: {
                            kind: "SelectionSet",
                            selections: [
                                {
                                    kind: "Field",
                                    name: { kind: "Name", value: "errors" },
                                    selectionSet: {
                                        kind: "SelectionSet",
                                        selections: [
                                            { kind: "Field", name: { kind: "Name", value: "field" } },
                                            {
                                                kind: "Field",
                                                name: { kind: "Name", value: "message" },
                                            },
                                        ],
                                    },
                                },
                                {
                                    kind: "Field",
                                    name: { kind: "Name", value: "user" },
                                    selectionSet: {
                                        kind: "SelectionSet",
                                        selections: [
                                            { kind: "Field", name: { kind: "Name", value: "_id" } },
                                            {
                                                kind: "Field",
                                                name: { kind: "Name", value: "createdAt" },
                                            },
                                            {
                                                kind: "Field",
                                                name: { kind: "Name", value: "updatedAt" },
                                            },
                                            {
                                                kind: "Field",
                                                name: { kind: "Name", value: "username" },
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
    ],
};
//# sourceMappingURL=graphql.js.map