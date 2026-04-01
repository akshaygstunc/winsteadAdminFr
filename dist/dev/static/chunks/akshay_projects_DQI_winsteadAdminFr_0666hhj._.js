(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/akshay/projects/DQI/winsteadAdminFr/utils/axios.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "instance",
    ()=>instance
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/akshay/projects/DQI/winsteadAdminFr/node_modules/axios/lib/axios.js [app-client] (ecmascript)");
;
const instance = __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].create({
    baseURL: "https://winsteadglobal.com/api/"
});
instance.interceptors.request.use((config)=>{
    if ("TURBOPACK compile-time truthy", 1) {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    console.log(instance.defaults.baseURL);
    return config;
});
const __TURBOPACK__default__export__ = instance;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/akshay/projects/DQI/winsteadAdminFr/services/inquiry.service.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "deleteInquiry",
    ()=>deleteInquiry,
    "getInquiries",
    ()=>getInquiries,
    "getInquiryById",
    ()=>getInquiryById,
    "updateInquiry",
    ()=>updateInquiry
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$utils$2f$axios$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/akshay/projects/DQI/winsteadAdminFr/utils/axios.ts [app-client] (ecmascript)");
;
const BASE_URL = "/inquiries";
const getInquiries = async (params)=>{
    const res = await __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$utils$2f$axios$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(BASE_URL, {
        params
    });
    return res.data;
};
const getInquiryById = async (id)=>{
    const res = await __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$utils$2f$axios$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`${BASE_URL}/${id}`);
    return res.data;
};
const updateInquiry = async (id, data)=>{
    const res = await __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$utils$2f$axios$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].patch(`${BASE_URL}/${id}`, data);
    return res.data;
};
const deleteInquiry = async (id)=>{
    const res = await __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$utils$2f$axios$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].delete(`${BASE_URL}/${id}`);
    return res.data;
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/akshay/projects/DQI/winsteadAdminFr/components/inquiries/InquiryModal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>InquiryModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/akshay/projects/DQI/winsteadAdminFr/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/akshay/projects/DQI/winsteadAdminFr/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/akshay/projects/DQI/winsteadAdminFr/node_modules/react-icons/fa/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$services$2f$inquiry$2e$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/akshay/projects/DQI/winsteadAdminFr/services/inquiry.service.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function InquiryModal({ data, onClose }) {
    _s();
    const [notes, setNotes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(data.notes || "");
    const handleSave = async ()=>{
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$services$2f$inquiry$2e$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateInquiry"])(data._id, {
                internalNotes: notes
            });
            onClose();
        } catch (err) {
            console.error("Save notes error:", err);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 bg-black/60 flex justify-center items-center z-50",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "bg-[#111111] p-6 w-full max-w-lg rounded-2xl border border-[#1A1A1A]",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex justify-between mb-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            children: "Inquiry Details"
                        }, void 0, false, {
                            fileName: "[project]/akshay/projects/DQI/winsteadAdminFr/components/inquiries/InquiryModal.tsx",
                            lineNumber: 28,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$react$2d$icons$2f$fa$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FaTimes"], {
                            onClick: onClose,
                            className: "cursor-pointer"
                        }, void 0, false, {
                            fileName: "[project]/akshay/projects/DQI/winsteadAdminFr/components/inquiries/InquiryModal.tsx",
                            lineNumber: 29,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/akshay/projects/DQI/winsteadAdminFr/components/inquiries/InquiryModal.tsx",
                    lineNumber: 27,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-3 text-sm",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                    children: "Name:"
                                }, void 0, false, {
                                    fileName: "[project]/akshay/projects/DQI/winsteadAdminFr/components/inquiries/InquiryModal.tsx",
                                    lineNumber: 34,
                                    columnNumber: 14
                                }, this),
                                " ",
                                data.name
                            ]
                        }, void 0, true, {
                            fileName: "[project]/akshay/projects/DQI/winsteadAdminFr/components/inquiries/InquiryModal.tsx",
                            lineNumber: 34,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                    children: "Contact:"
                                }, void 0, false, {
                                    fileName: "[project]/akshay/projects/DQI/winsteadAdminFr/components/inquiries/InquiryModal.tsx",
                                    lineNumber: 35,
                                    columnNumber: 14
                                }, this),
                                " ",
                                data.contact
                            ]
                        }, void 0, true, {
                            fileName: "[project]/akshay/projects/DQI/winsteadAdminFr/components/inquiries/InquiryModal.tsx",
                            lineNumber: 35,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                    children: "Project:"
                                }, void 0, false, {
                                    fileName: "[project]/akshay/projects/DQI/winsteadAdminFr/components/inquiries/InquiryModal.tsx",
                                    lineNumber: 36,
                                    columnNumber: 14
                                }, this),
                                " ",
                                data.project
                            ]
                        }, void 0, true, {
                            fileName: "[project]/akshay/projects/DQI/winsteadAdminFr/components/inquiries/InquiryModal.tsx",
                            lineNumber: 36,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("b", {
                                    children: "Vendor:"
                                }, void 0, false, {
                                    fileName: "[project]/akshay/projects/DQI/winsteadAdminFr/components/inquiries/InquiryModal.tsx",
                                    lineNumber: 37,
                                    columnNumber: 14
                                }, this),
                                " ",
                                data.vendor
                            ]
                        }, void 0, true, {
                            fileName: "[project]/akshay/projects/DQI/winsteadAdminFr/components/inquiries/InquiryModal.tsx",
                            lineNumber: 37,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/akshay/projects/DQI/winsteadAdminFr/components/inquiries/InquiryModal.tsx",
                    lineNumber: 33,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mt-4",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                        placeholder: "Add internal notes...",
                        value: notes,
                        onChange: (e)=>setNotes(e.target.value),
                        className: "input h-[100px]"
                    }, void 0, false, {
                        fileName: "[project]/akshay/projects/DQI/winsteadAdminFr/components/inquiries/InquiryModal.tsx",
                        lineNumber: 42,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/akshay/projects/DQI/winsteadAdminFr/components/inquiries/InquiryModal.tsx",
                    lineNumber: 41,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex justify-end gap-3 mt-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: onClose,
                            children: "Close"
                        }, void 0, false, {
                            fileName: "[project]/akshay/projects/DQI/winsteadAdminFr/components/inquiries/InquiryModal.tsx",
                            lineNumber: 52,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleSave,
                            className: "bg-[#C8A96A] px-4 py-2 rounded-xl text-black",
                            children: "Save Notes"
                        }, void 0, false, {
                            fileName: "[project]/akshay/projects/DQI/winsteadAdminFr/components/inquiries/InquiryModal.tsx",
                            lineNumber: 53,
                            columnNumber: 10
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/akshay/projects/DQI/winsteadAdminFr/components/inquiries/InquiryModal.tsx",
                    lineNumber: 51,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/akshay/projects/DQI/winsteadAdminFr/components/inquiries/InquiryModal.tsx",
            lineNumber: 24,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/akshay/projects/DQI/winsteadAdminFr/components/inquiries/InquiryModal.tsx",
        lineNumber: 22,
        columnNumber: 5
    }, this);
}
_s(InquiryModal, "9lyMULfn9oW+bMeIUvSd98D4Cz0=");
_c = InquiryModal;
var _c;
__turbopack_context__.k.register(_c, "InquiryModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/akshay/projects/DQI/winsteadAdminFr/components/inquiries/InquiryTable.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>InquiryTable
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/akshay/projects/DQI/winsteadAdminFr/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/akshay/projects/DQI/winsteadAdminFr/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$components$2f$inquiries$2f$InquiryModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/akshay/projects/DQI/winsteadAdminFr/components/inquiries/InquiryModal.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$services$2f$inquiry$2e$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/akshay/projects/DQI/winsteadAdminFr/services/inquiry.service.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function InquiryTable({ search, status }) {
    _s();
    const [page, setPage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(1);
    const [selected, setSelected] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [data, setData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [meta, setMeta] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const limit = 5;
    // ✅ FETCH DATA
    const fetchData = async ()=>{
        try {
            const res = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$services$2f$inquiry$2e$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getInquiries"])({
                page,
                limit,
                search,
                status: status === "all" ? undefined : status
            });
            setData(res.data);
            setMeta(res.meta);
        } catch (err) {
            console.error("Inquiry fetch error:", err);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "InquiryTable.useEffect": ()=>{
            fetchData();
        }
    }["InquiryTable.useEffect"], [
        page,
        search,
        status
    ]);
    // ✅ STATUS UPDATE
    const handleStatusChange = async (id, value)=>{
        try {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$services$2f$inquiry$2e$service$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateInquiry"])(id, {
                status: value
            });
            fetchData();
        } catch (err) {
            console.error("Status update error:", err);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-[#111111] rounded-2xl border border-[#1A1A1A] overflow-x-auto",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                    className: "w-full text-sm",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                            className: "border-b border-[#1A1A1A] text-gray-400",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "p-4 text-left",
                                        children: "Name"
                                    }, void 0, false, {
                                        fileName: "[project]/akshay/projects/DQI/winsteadAdminFr/components/inquiries/InquiryTable.tsx",
                                        lineNumber: 54,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "p-4",
                                        children: "Contact"
                                    }, void 0, false, {
                                        fileName: "[project]/akshay/projects/DQI/winsteadAdminFr/components/inquiries/InquiryTable.tsx",
                                        lineNumber: 55,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "p-4",
                                        children: "Project"
                                    }, void 0, false, {
                                        fileName: "[project]/akshay/projects/DQI/winsteadAdminFr/components/inquiries/InquiryTable.tsx",
                                        lineNumber: 56,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "p-4",
                                        children: "Vendor"
                                    }, void 0, false, {
                                        fileName: "[project]/akshay/projects/DQI/winsteadAdminFr/components/inquiries/InquiryTable.tsx",
                                        lineNumber: 57,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "p-4",
                                        children: "Status"
                                    }, void 0, false, {
                                        fileName: "[project]/akshay/projects/DQI/winsteadAdminFr/components/inquiries/InquiryTable.tsx",
                                        lineNumber: 58,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "p-4 text-right",
                                        children: "Action"
                                    }, void 0, false, {
                                        fileName: "[project]/akshay/projects/DQI/winsteadAdminFr/components/inquiries/InquiryTable.tsx",
                                        lineNumber: 59,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/akshay/projects/DQI/winsteadAdminFr/components/inquiries/InquiryTable.tsx",
                                lineNumber: 53,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/akshay/projects/DQI/winsteadAdminFr/components/inquiries/InquiryTable.tsx",
                            lineNumber: 52,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                            children: data.map((i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    className: "border-b border-[#1A1A1A]",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "p-4",
                                            children: i.name
                                        }, void 0, false, {
                                            fileName: "[project]/akshay/projects/DQI/winsteadAdminFr/components/inquiries/InquiryTable.tsx",
                                            lineNumber: 66,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "p-4 text-center",
                                            children: i.phone
                                        }, void 0, false, {
                                            fileName: "[project]/akshay/projects/DQI/winsteadAdminFr/components/inquiries/InquiryTable.tsx",
                                            lineNumber: 67,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "p-4 text-center",
                                            children: i.projectId?.name || "-"
                                        }, void 0, false, {
                                            fileName: "[project]/akshay/projects/DQI/winsteadAdminFr/components/inquiries/InquiryTable.tsx",
                                            lineNumber: 68,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "p-4 text-center",
                                            children: i.vendorId?.name || "-"
                                        }, void 0, false, {
                                            fileName: "[project]/akshay/projects/DQI/winsteadAdminFr/components/inquiries/InquiryTable.tsx",
                                            lineNumber: 71,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "p-4 text-center",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                value: i.status,
                                                onChange: (e)=>handleStatusChange(i._id, e.target.value),
                                                className: "bg-[#0f0f0f] border border-[#1A1A1A] rounded px-2 py-1 text-xs",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "new",
                                                        children: "New"
                                                    }, void 0, false, {
                                                        fileName: "[project]/akshay/projects/DQI/winsteadAdminFr/components/inquiries/InquiryTable.tsx",
                                                        lineNumber: 84,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "contacted",
                                                        children: "Contacted"
                                                    }, void 0, false, {
                                                        fileName: "[project]/akshay/projects/DQI/winsteadAdminFr/components/inquiries/InquiryTable.tsx",
                                                        lineNumber: 85,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: "closed",
                                                        children: "Closed"
                                                    }, void 0, false, {
                                                        fileName: "[project]/akshay/projects/DQI/winsteadAdminFr/components/inquiries/InquiryTable.tsx",
                                                        lineNumber: 86,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/akshay/projects/DQI/winsteadAdminFr/components/inquiries/InquiryTable.tsx",
                                                lineNumber: 77,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/akshay/projects/DQI/winsteadAdminFr/components/inquiries/InquiryTable.tsx",
                                            lineNumber: 76,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "p-4 text-right",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>setSelected(i),
                                                className: "text-[#C8A96A]",
                                                children: "View"
                                            }, void 0, false, {
                                                fileName: "[project]/akshay/projects/DQI/winsteadAdminFr/components/inquiries/InquiryTable.tsx",
                                                lineNumber: 92,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/akshay/projects/DQI/winsteadAdminFr/components/inquiries/InquiryTable.tsx",
                                            lineNumber: 91,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, i._id, true, {
                                    fileName: "[project]/akshay/projects/DQI/winsteadAdminFr/components/inquiries/InquiryTable.tsx",
                                    lineNumber: 65,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/akshay/projects/DQI/winsteadAdminFr/components/inquiries/InquiryTable.tsx",
                            lineNumber: 63,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/akshay/projects/DQI/winsteadAdminFr/components/inquiries/InquiryTable.tsx",
                    lineNumber: 51,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/akshay/projects/DQI/winsteadAdminFr/components/inquiries/InquiryTable.tsx",
                lineNumber: 50,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex justify-between",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        disabled: page === 1,
                        onClick: ()=>setPage(page - 1),
                        children: "Prev"
                    }, void 0, false, {
                        fileName: "[project]/akshay/projects/DQI/winsteadAdminFr/components/inquiries/InquiryTable.tsx",
                        lineNumber: 107,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-sm",
                        children: [
                            "Page ",
                            meta.page || 1,
                            " / ",
                            meta.totalPages || 1
                        ]
                    }, void 0, true, {
                        fileName: "[project]/akshay/projects/DQI/winsteadAdminFr/components/inquiries/InquiryTable.tsx",
                        lineNumber: 114,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        disabled: page === meta.totalPages,
                        onClick: ()=>setPage(page + 1),
                        children: "Next"
                    }, void 0, false, {
                        fileName: "[project]/akshay/projects/DQI/winsteadAdminFr/components/inquiries/InquiryTable.tsx",
                        lineNumber: 118,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/akshay/projects/DQI/winsteadAdminFr/components/inquiries/InquiryTable.tsx",
                lineNumber: 106,
                columnNumber: 7
            }, this),
            selected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$components$2f$inquiries$2f$InquiryModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                data: selected,
                onClose: ()=>setSelected(null),
                refresh: fetchData
            }, void 0, false, {
                fileName: "[project]/akshay/projects/DQI/winsteadAdminFr/components/inquiries/InquiryTable.tsx",
                lineNumber: 128,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/akshay/projects/DQI/winsteadAdminFr/components/inquiries/InquiryTable.tsx",
        lineNumber: 47,
        columnNumber: 5
    }, this);
}
_s(InquiryTable, "lC6jjiKXko+YbmArstefu9xrXcE=");
_c = InquiryTable;
var _c;
__turbopack_context__.k.register(_c, "InquiryTable");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/akshay/projects/DQI/winsteadAdminFr/app/inquiries/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>InquiriesPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/akshay/projects/DQI/winsteadAdminFr/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$components$2f$inquiries$2f$InquiryTable$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/akshay/projects/DQI/winsteadAdminFr/components/inquiries/InquiryTable.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/akshay/projects/DQI/winsteadAdminFr/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
const inquiryTabs = [
    {
        label: "All",
        value: "all"
    },
    {
        label: "Contact Queries",
        value: "contact_query"
    },
    {
        label: "App Contact",
        value: "app_contact_query"
    },
    {
        label: "Call Requests",
        value: "app_call_request"
    },
    {
        label: "Review Requests",
        value: "review_request"
    }
];
function InquiriesPage() {
    _s();
    const [search, setSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [status, setStatus] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("all");
    const [type, setType] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("all");
    const pageText = (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "InquiriesPage.useMemo[pageText]": ()=>{
            switch(type){
                case "contact_query":
                    return {
                        title: "Contact Queries",
                        subtitle: "Manage website contact form inquiries"
                    };
                case "app_contact_query":
                    return {
                        title: "App Contact Queries",
                        subtitle: "Manage app contact inquiries"
                    };
                case "app_call_request":
                    return {
                        title: "Call Requests",
                        subtitle: "Manage app callback requests"
                    };
                case "review_request":
                    return {
                        title: "Review Requests",
                        subtitle: "Manage review-related requests"
                    };
                default:
                    return {
                        title: "Inquiries",
                        subtitle: "Manage all customer inquiries and leads"
                    };
            }
        }
    }["InquiriesPage.useMemo[pageText]"], [
        type
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "space-y-6 rounded-[28px] border border-white/10 bg-[#050505] p-6 md:p-8",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-2xl md:text-3xl font-semibold text-white",
                        children: pageText.title
                    }, void 0, false, {
                        fileName: "[project]/akshay/projects/DQI/winsteadAdminFr/app/inquiries/page.tsx",
                        lineNumber: 60,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm text-gray-400 mt-1",
                        children: pageText.subtitle
                    }, void 0, false, {
                        fileName: "[project]/akshay/projects/DQI/winsteadAdminFr/app/inquiries/page.tsx",
                        lineNumber: 63,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/akshay/projects/DQI/winsteadAdminFr/app/inquiries/page.tsx",
                lineNumber: 59,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-wrap gap-4",
                children: inquiryTabs.map((tab)=>{
                    const isActive = type === tab.value;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setType(tab.value),
                        className: `min-w-[80px] rounded-[10px] px-2 py-2 text-2xl text-sm   transition ${isActive ? "bg-[#C8A96A] text-black" : "bg-[#E7E7EA] text-[#4A4A54] hover:bg-white"}`,
                        children: tab.label
                    }, tab.value, false, {
                        fileName: "[project]/akshay/projects/DQI/winsteadAdminFr/app/inquiries/page.tsx",
                        lineNumber: 72,
                        columnNumber: 13
                    }, this);
                })
            }, void 0, false, {
                fileName: "[project]/akshay/projects/DQI/winsteadAdminFr/app/inquiries/page.tsx",
                lineNumber: 67,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "border-t border-white/20 pt-6"
            }, void 0, false, {
                fileName: "[project]/akshay/projects/DQI/winsteadAdminFr/app/inquiries/page.tsx",
                lineNumber: 86,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rounded-[32px] border border-white bg-[#050505] overflow-hidden",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 md:p-6 border-b border-white/15",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col md:flex-row gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        placeholder: "Search by name, email, phone...",
                                        value: search,
                                        onChange: (e)=>setSearch(e.target.value),
                                        className: "h-12 rounded-xl border border-white/20 bg-transparent px-4 text-white placeholder:text-gray-500 outline-none md:w-[280px]"
                                    }, void 0, false, {
                                        fileName: "[project]/akshay/projects/DQI/winsteadAdminFr/app/inquiries/page.tsx",
                                        lineNumber: 93,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                        value: status,
                                        onChange: (e)=>setStatus(e.target.value),
                                        className: "h-12 rounded-xl border border-white/20 bg-transparent px-4 text-white outline-none md:w-[200px]",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "all",
                                                className: "text-black",
                                                children: "All Status"
                                            }, void 0, false, {
                                                fileName: "[project]/akshay/projects/DQI/winsteadAdminFr/app/inquiries/page.tsx",
                                                lineNumber: 105,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "new",
                                                className: "text-black",
                                                children: "New"
                                            }, void 0, false, {
                                                fileName: "[project]/akshay/projects/DQI/winsteadAdminFr/app/inquiries/page.tsx",
                                                lineNumber: 108,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "contacted",
                                                className: "text-black",
                                                children: "Contacted"
                                            }, void 0, false, {
                                                fileName: "[project]/akshay/projects/DQI/winsteadAdminFr/app/inquiries/page.tsx",
                                                lineNumber: 111,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                value: "closed",
                                                className: "text-black",
                                                children: "Closed"
                                            }, void 0, false, {
                                                fileName: "[project]/akshay/projects/DQI/winsteadAdminFr/app/inquiries/page.tsx",
                                                lineNumber: 114,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/akshay/projects/DQI/winsteadAdminFr/app/inquiries/page.tsx",
                                        lineNumber: 100,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/akshay/projects/DQI/winsteadAdminFr/app/inquiries/page.tsx",
                                lineNumber: 92,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "h-12 rounded-xl bg-[#C8A96A] px-5 text-sm font-medium text-black hover:opacity-90",
                                children: "Export CSV"
                            }, void 0, false, {
                                fileName: "[project]/akshay/projects/DQI/winsteadAdminFr/app/inquiries/page.tsx",
                                lineNumber: 120,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/akshay/projects/DQI/winsteadAdminFr/app/inquiries/page.tsx",
                        lineNumber: 91,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-0",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$akshay$2f$projects$2f$DQI$2f$winsteadAdminFr$2f$components$2f$inquiries$2f$InquiryTable$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            search: search,
                            status: status,
                            type: type
                        }, void 0, false, {
                            fileName: "[project]/akshay/projects/DQI/winsteadAdminFr/app/inquiries/page.tsx",
                            lineNumber: 127,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/akshay/projects/DQI/winsteadAdminFr/app/inquiries/page.tsx",
                        lineNumber: 126,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/akshay/projects/DQI/winsteadAdminFr/app/inquiries/page.tsx",
                lineNumber: 89,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/akshay/projects/DQI/winsteadAdminFr/app/inquiries/page.tsx",
        lineNumber: 57,
        columnNumber: 5
    }, this);
}
_s(InquiriesPage, "8qbqPY0oqqThlZenZ3bBSQHgnnc=");
_c = InquiriesPage;
var _c;
__turbopack_context__.k.register(_c, "InquiriesPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=akshay_projects_DQI_winsteadAdminFr_0666hhj._.js.map