INSERT INTO "CourseProgram" (
    "id",
    "slug",
    "title",
    "description",
    "level",
    "durationWeeks",
    "sessionDurationMin",
    "capacity",
    "isActive",
    "sortOrder",
    "createdAt",
    "updatedAt"
) VALUES
(
    'course_program_ai_system_development_intro',
    'ai-system-development-intro',
    'AI 系統開發入門班：Vibe Coding 從設計到上線',
    '8 週帶領團隊從需求拆解、前端原型、表單驗證、API 與資料儲存，一路完成可部署的小型 AI 輔助系統。',
    '入門',
    8,
    120,
    12,
    true,
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    'course_program_ai_system_development_advanced',
    'ai-system-development-advanced',
    'AI 系統開發進階班：架構、專案管理與雲端部署',
    '8 週聚焦 AI 系統開發生命週期、架構設計、資料模型、後端 API、AI 工作流與部署維運，適合已有原型經驗的團隊。',
    '進階',
    8,
    120,
    10,
    true,
    2,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("slug") DO UPDATE SET
    "title" = EXCLUDED."title",
    "description" = EXCLUDED."description",
    "level" = EXCLUDED."level",
    "durationWeeks" = EXCLUDED."durationWeeks",
    "sessionDurationMin" = EXCLUDED."sessionDurationMin",
    "capacity" = EXCLUDED."capacity",
    "isActive" = EXCLUDED."isActive",
    "sortOrder" = EXCLUDED."sortOrder",
    "updatedAt" = CURRENT_TIMESTAMP;
