# AI 재정사업 데이터 파일 활용 가이드

> 본 시스템에서 생성한 JSON 데이터 파일과 Markdown 예산서의 구조, 활용 방법

---

## 1. 데이터 파일 종류

| 파일 | 경로 | 크기 | 설명 |
|------|------|------|------|
| `budget_raw.json` | `output/data/` | ~12.6MB | PDF에서 추출한 원시 데이터 (533개 사업) |
| `budget_db.json` | `output/data/` | ~15MB | 분석용 최종 DB (사업 + 부처/분야 집계 + 중복 분석) |
| `toc_mapping.json` | `output/data/` | ~50KB | PDF 목차-페이지 매핑 (533개 항목) |

---

## 2. budget_raw.json (원시 추출 데이터)

### 2.1 구조

최상위: JSON 배열 (533개 객체)

```json
[
  {
    "id": 1,
    "name": "감사원_전산운영경비(정보화)",
    "project_name": "전산운영경비(정보화)",
    "code": "1134-309",
    "department": "감사원",
    "division": "디지털감사국//적극행정공공/감사지원관",
    "account_type": "일반회계",
    "field": "일반·지방행정",
    "sector": "일반행정",
    "program": { "code": "1100", "name": "감사활동 및 행정지원" },
    "unit_project": { "code": "1134", "name": "전산운영경비" },
    "detail_project": { "code": "309", "name": "전산운영경비(정보화)" },
    "status": "신규",
    "support_type": "직접",
    "implementing_agency": "감사원",
    "subsidy_rate": null,
    "loan_rate": null,
    "project_managers": [
      {
        "sub_project": "감사자료 분석시스템 구축ㆍ운영",
        "managing_dept": "디지털감사국",
        "implementing_agency": "감사원",
        "manager": null,
        "phone": null
      }
    ],
    "budget": {
      "2024_settlement": 12508.0,
      "2025_original": 16111.0,
      "2025_supplementary": 16111.0,
      "2026_request": 14762.0,
      "2026_budget": 10300.0,
      "change_amount": -5811.0,
      "change_rate": -36.1
    },
    "project_period": {
      "start_year": null,
      "end_year": null,
      "duration": null,
      "raw": null
    },
    "total_cost": {
      "total": null,
      "government": null,
      "raw": null
    },
    "sub_projects": [
      {
        "name": "감사자료분석시스템 구축ㆍ운영",
        "budget_2024": 1811.0,
        "budget_2025": 1781.0,
        "budget_2026": 2086.0
      }
    ],
    "purpose": "○사업목적 텍스트...",
    "description": "○사업내용 텍스트...",
    "legal_basis": "○법적근거 텍스트..."
  }
]
```

### 2.2 필드 상세

| 필드 | 타입 | 설명 | null 가능 |
|------|------|------|-----------|
| `id` | integer | 순번 (1~533) | N |
| `name` | string | `부처명_사업명` 형태의 고유 식별자 | N |
| `project_name` | string | 사업명 (부처명 제외) | N |
| `code` | string | 사업코드 `NNNN-NNN` | Y (4건) |
| `department` | string | 소관부처 | N |
| `division` | string | 소관부서 (복수 시 `/` 구분) | Y |
| `account_type` | string | `일반회계` / `특별회계` / `기금` | N |
| `field` | string | 분야 (예: `과학기술`, `산업·중소기업·에너지`) | N |
| `sector` | string | 부문 | Y |
| `program` | object | 프로그램 `{code, name}` | N |
| `unit_project` | object | 단위사업 `{code, name}` | N |
| `detail_project` | object | 세부사업 `{code, name}` | N |
| `status` | string | `계속` / `신규` | N |
| `support_type` | string | `직접` / `출연` / `보조` / `융자` / `출자` 등 | Y |
| `implementing_agency` | string | 시행기관 | Y (1건) |
| `subsidy_rate` | string | 보조율 | Y |
| `loan_rate` | string | 융자율 | Y |
| `project_managers` | array | 사업관리자 배열 | N (빈 배열 가능) |
| `budget` | object | 예산 데이터 (아래 참조) | N |
| `project_period` | object | 사업기간 `{start_year, end_year, duration, raw}` | Y (각 필드) |
| `total_cost` | object | 총사업비 `{total, government, raw}` | Y (각 필드) |
| `sub_projects` | array | 내역사업 배열 | N (빈 배열 가능) |
| `purpose` | string | 사업목적 텍스트 | Y (16건) |
| `description` | string | 사업내용 텍스트 | Y |
| `legal_basis` | string | 법적근거 텍스트 | Y (1건) |

#### budget 객체

| 필드 | 타입 | 단위 | 설명 |
|------|------|------|------|
| `2024_settlement` | number/null | 백만원 | 2024년 결산액 (세출결산 기준) |
| `2025_original` | number/null | 백만원 | 2025년 본예산 (당초 국회 의결 예산) |
| `2025_supplementary` | number/null | 백만원 | 2025년 추경예산 (추가경정예산 편성 시의 수정예산. 추경 미편성 시 본예산과 동일) |
| `2026_request` | number/null | 백만원 | 2026년 부처 요구안 (기재부 제출 전 부처 요구 금액) |
| `2026_budget` | number | 백만원 | 2026년 확정예산 (국회 의결 확정 금액. 항상 존재) |
| `change_amount` | number/null | 백만원 | 증감액 (= 2026_budget - 2025_original, 본예산 대비) |
| `change_rate` | number/null | % | 증감률 (= change_amount / 2025_original × 100) |

#### sub_projects 배열 항목

| 필드 | 타입 | 설명 |
|------|------|------|
| `name` | string | 내역사업명 |
| `budget_2024` | number/null | 2024 예산 (백만원) |
| `budget_2025` | number/null | 2025 예산 (백만원) |
| `budget_2026` | number/null | 2026 예산 (백만원) |

### 2.3 budget_raw.json vs budget_db.json 차이

| 항목 | budget_raw.json | budget_db.json |
|------|----------------|----------------|
| 구조 | 단순 배열 | `{metadata, projects, analysis}` |
| 내역사업 | PDF 추출 원본 | 노이즈 필터링 + 예산 보정 완료 |
| 추가 필드 | 없음 | `is_rnd`, `is_informatization`, `keywords`, `ai_domains`, `page_start/end` |
| 분석 데이터 | 없음 | 부처별/분야별 집계, 중복 분석, 키워드 클러스터 |
| 용도 | 추출 결과 보존, 디버깅 | 대시보드 및 분석 활용 |

---

## 3. budget_db.json (분석용 최종 DB)

### 3.1 최상위 구조

```json
{
  "metadata": { /* 메타데이터 */ },
  "projects": [ /* 533개 프로젝트 배열 */ ],
  "analysis": { /* 9개 분석 섹션 */ }
}
```

### 3.2 metadata

```json
{
  "total_projects": 533,
  "total_departments": 41,
  "total_budget_2026": 27537241.0,
  "total_budget_2025": 21704530.0,
  "budget_change": 5832711.0,
  "rnd_projects": 288,
  "info_projects": 70,
  "new_projects": 6,
  "budget_mismatch_count": 0,
  "extraction_date": "2026-03-05",
  "source": "2026년 AI 재정사업 현황"
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| `total_projects` | integer | 전체 사업 수 |
| `total_departments` | integer | 전체 부처 수 |
| `total_budget_2026` | number | 2026년 확정예산 합계 (백만원) |
| `total_budget_2025` | number | 2025년 본예산 합계 (백만원) |
| `budget_change` | number | 전년 대비 증감액 (= total_budget_2026 - total_budget_2025) |
| `rnd_projects` | integer | R&D 사업 수 |
| `info_projects` | integer | 정보화 사업 수. `analysis.by_type.정보화.count`(68)와 차이가 있는데, `(R&D,정보화)` 중복 유형 사업이 metadata에서는 정보화로도 카운트되나 by_type에서는 R&D로 분류되기 때문 |
| `new_projects` | integer | 신규 사업 수 (status="신규") |
| `budget_mismatch_count` | integer | 내역사업 합계 불일치 사업 수 (보정 완료, 현재 0건) |
| `extraction_date` | string | 데이터 추출일 (ISO 8601 날짜) |
| `source` | string | 원본 문서명 |

### 3.3 projects 배열

budget_raw.json의 모든 필드에 추가로 다음 필드가 포함된다.

| 추가 필드 | 타입 | 설명 |
|-----------|------|------|
| `is_rnd` | boolean | R&D 사업 여부 (사업명에 `(R&D)` 포함) |
| `is_informatization` | boolean | 정보화 사업 여부 (사업명에 `(정보화)` 포함) |
| `keywords` | string[] | 사업명에서 추출한 핵심 키워드 |
| `ai_domains` | string[] | AI 적용 도메인 (27종, 키워드 기반 자동 분류). 미매칭 시 부처 보조 분류, 최종 `["기타"]` |
| `ai_tech` | string[] / absent | AI 기술 유형 (16종, 복수 태깅). 미매칭 시 필드 없음 |
| `rnd_stage` | string[] / absent | R&D 단계 (5종 중 대표 1개). 비R&D 사업은 필드 없음 |
| `page_start` | integer | PDF 시작 페이지 |
| `page_end` | integer | PDF 종료 페이지 |

#### ai_domains 27종

| 영역 | 도메인 |
|------|--------|
| 기술 인프라 | AI반도체, LLM/언어모델, 데이터, 클라우드/컴퓨팅, 통신/네트워크, 피지컬AI/디바이스, R&D 지원 |
| 산업/경제 | 제조/스마트팩토리, 금융, 교통/모빌리티, 로봇, 건설/스마트시티, 문화/콘텐츠, 해양/수산, 농업/식품 |
| 공공/사회 | 국방/안보, 교육/인재, 보안/사이버, 의료/바이오, 법률/치안, 행정/전자정부, 재난/안전, 디지털전환(AX) |
| 자연/환경 | 에너지, 환경/기후, 우주/위성, 산림/생태 |

#### ai_tech 16종

| 계층 | 기술 유형 |
|------|----------|
| 모델/알고리즘 | 생성AI/LLM, 파운데이션모델, AGI/Agent, 컴퓨터비전, 자연어처리, 강화학습/최적화, 예측/분석AI |
| 하드웨어/인프라 | AI반도체/HW, GPU/클라우드, 데이터/MLOps |
| 응용/태스크 | 로보틱스/자율시스템, 피지컬/휴머노이드, 신약/의료AI, 제조/산업AI |
| 거버넌스/보안 | AI안전/신뢰, AI보안 |

#### rnd_stage 5종

`기초연구` (TRL 1-3) / `응용연구` (TRL 3-5) / `개발` (TRL 4-6) / `실증/시범` (TRL 6-8) / `사업화/확산` (TRL 8-9)

### 3.4 analysis 섹션

#### 3.4.1 by_department (부처별 집계)

```json
{
  "과학기술정보통신부": {
    "count": 192,
    "total_2026": 8792410.0,
    "total_2025": 6781978.0,
    "total_2024": 4359159.0,
    "total_2026_existing": 7966043.0,
    "total_2025_existing": 6781978.0,
    "new_budget_count": 71,
    "new_budget_total": 826367.0,
    "rnd_count": 108,
    "info_count": 8,
    "new_count": 0,
    "projects": [],
    "avg_budget": 45793.8,
    "change_amount": 2010432.0,
    "change_rate": 17.5
  }
}
```

| 필드 | 타입 | 설명 |
|------|------|------|
| `count` | integer | 해당 부처 사업 수 |
| `total_2026` | number | 2026년 예산 합계 (백만원) |
| `total_2025` | number | 2025년 예산 합계 (백만원) |
| `total_2024` | number | 2024년 결산 합계 (백만원) |
| `total_2026_existing` | number | 2026년 기존사업 예산 합계 |
| `total_2025_existing` | number | 2025년 기존사업 예산 합계 |
| `new_budget_count` | integer | 신규 예산 편성 사업 수 |
| `new_budget_total` | number | 신규 예산 합계 (백만원) |
| `rnd_count` | integer | R&D 사업 수 |
| `info_count` | integer | 정보화 사업 수 |
| `new_count` | integer | 신규 사업 수 |
| `projects` | array | 프로젝트 목록 (현재 빈 배열) |
| `avg_budget` | number | 평균 예산 (백만원) |
| `change_amount` | number | 전년 대비 증감액 (백만원) |
| `change_rate` | number | 전년 대비 증감률 (%) |

#### 3.4.2 by_type (유형별 집계)

```json
{
  "R&D": { "count": 288, "total": 10155608.0 },
  "정보화": { "count": 68, "total": 1632956.0 },
  "일반": { "count": 177, "total": 15748677.0 }
}
```

> 각 항목의 필드: `count` (사업 수), `total` (2026년 예산 합계, 백만원)

#### 3.4.3 by_domain (AI 도메인별 집계)

```json
{
  "보안/사이버": { "count": 37, "total": 1122040.0 },
  "의료/바이오": { "count": 62, "total": 865903.0 },
  "LLM/언어모델": { "count": 44, "total": 2753937.0 },
  "데이터": { "count": 116, "total": 5081253.0 },
  "교육/인재": { "count": 66, "total": 6823880.0 },
  "디지털전환(AX)": { "count": 113, "total": 3781788.0 }
  // ... 27개 도메인
}
```

> 각 항목의 필드: `count` (사업 수), `total` (2026년 예산 합계, 백만원)

#### 3.4.4 top_increases / top_decreases (예산 증감 TOP 20)

```json
[
  {
    "id": 123,
    "name": "국가 플래그십 초고성능컴퓨팅",
    "department": "과학기술정보통신부",
    "budget_2026": 68431.0,
    "change_amount": 57237.0,
    "change_rate": 511.3
  }
]
```

#### 3.4.5 duplicates (중복 의심 그룹)

97개 그룹. 각 그룹에 Jaccard/TF-IDF/LSA 복합 유사도와 등급 포함.

```json
[
  {
    "group_name": "AI·SW 중심대학",
    "project_count": 5,
    "total_budget": 1551810.0,
    "departments": ["방송미디어통신위원회", "과학기술정보통신부", "교육부"],
    "projects": [
      { "id": 42, "name": "AI·SW 중심대학", "department": "과학기술정보통신부", "budget_2026": 117960.0 }
    ],
    "similarity_score": 0.0,
    "tfidf_score": 0.032,
    "lsa_score": 0.335,
    "grade": "낮음"
  }
]
```

> `projects` 배열 항목의 예산 필드명은 `budget_2026`이다 (상위 `budget`이 아님).

**grade 등급** (문자열):
| 등급 | 의미 |
|------|------|
| `"높음"` | 고유사 |
| `"중간"` | 중유사 |
| `"낮음"` | 저유사 |

#### 3.4.6 duplicate_network (유사도 네트워크)

사업 쌍별 유사도 데이터. 네트워크 시각화 및 클러스터링에 활용.

```json
[
  {
    "source": 10,
    "target": 136,
    "jaccard": 1.0,
    "tfidf": 0.235,
    "lsa": 0.709,
    "combined": 1.0,
    "grade": "높음"
  }
]
```

> `source`/`target`은 프로젝트 `id` (정수)이다. 프로젝트명이 아님에 유의.
> `grade`는 문자열 (`"높음"`, `"중간"`, `"낮음"`).

#### 3.4.7 keyword_clusters (키워드 클러스터)

16개 키워드별 교차부처 사업 그룹.

```json
[
  {
    "keyword": "클라우드",
    "project_count": 28,
    "department_count": 11,
    "departments": ["과기부", "행안부", "국방부"],
    "total_budget": 3093347.0,
    "projects": [ { "id": 1, "name": "...", "department": "감사원", "budget_2026": 10300.0 } ]
  }
]
```

> `projects` 배열 항목 필드: `id`, `name`, `department`, `budget_2026`

#### 3.4.8 same_agency (동일 시행기관)

17개 그룹. 동일 기관이 여러 부처에서 사업을 수행하는 경우.

```json
[
  {
    "agency": "한국연구재단",
    "project_count": 22,
    "department_count": 4,
    "departments": ["기후에너지환경부", "법무부", "과학기술정보통신부", "교육부"],
    "total_budget": 2550340.0,
    "projects": [
      { "id": 38, "name": "AI+S&T 혁신 기술 개발(R&D)", "department": "과학기술정보통신부", "budget_2026": 4500.0 }
    ]
  }
]
```

> `projects` 배열 항목 필드: `id`, `name`, `department`, `budget_2026`

---

## 4. toc_mapping.json (목차-페이지 매핑)

### 4.1 구조

```json
[
  {
    "id": 1,
    "full_name": "감사원_전산운영경비(정보화)",
    "page_start": 20,
    "page_end": 29,
    "department": "감사원",
    "project_name": "전산운영경비(정보화)"
  }
]
```

### 4.2 활용

- PDF에서 특정 사업의 원본 페이지 범위를 찾을 때 사용
- `page_start`~`page_end`로 PyMuPDF 등에서 해당 페이지만 추출 가능
- 페이지 번호는 0-based (PyMuPDF 기준)

---

## 5. 데이터 활용 방법

### 5.1 Python에서 활용

```python
import json

# 데이터 로드
with open('output/data/budget_db.json', encoding='utf-8') as f:
    db = json.load(f)

projects = db['projects']
analysis = db['analysis']

# 예시 1: 부처별 2026 예산 합계
from collections import defaultdict
dept_budget = defaultdict(float)
for p in projects:
    dept_budget[p['department']] += p['budget']['2026_budget']

for dept, budget in sorted(dept_budget.items(), key=lambda x: -x[1])[:10]:
    print(f"{dept}: {budget:,.0f} 백만원 ({budget/1e6:.2f}조원)")

# 예시 2: R&D 사업 중 생성AI 관련
genai_rnd = [p for p in projects
             if p['is_rnd'] and '생성AI' in str(p.get('ai_domains', []))]
print(f"생성AI R&D: {len(genai_rnd)}건, "
      f"{sum(p['budget']['2026_budget'] for p in genai_rnd):,.0f}백만원")

# 예시 3: 전년 대비 50% 이상 증가 사업
big_increase = [p for p in projects
                if p['budget'].get('change_rate') and p['budget']['change_rate'] > 50]
print(f"50%+ 증가: {len(big_increase)}건")

# 예시 4: 중복 의심 사업 (grade 1-2, 유사도 75%+)
high_dup = [g for g in analysis['duplicates'] if g['grade'] <= 2]
print(f"고유사 중복 그룹: {len(high_dup)}개")

# 예시 5: 내역사업 단위 분석
all_subs = []
for p in projects:
    for s in p.get('sub_projects', []):
        all_subs.append({
            'parent': p['project_name'],
            'department': p['department'],
            'sub_name': s['name'],
            'budget_2026': s.get('budget_2026', 0) or 0
        })
print(f"총 내역사업: {len(all_subs)}건")
```

### 5.2 pandas 활용 (테이블 분석)

```python
import pandas as pd
import json

with open('output/data/budget_db.json', encoding='utf-8') as f:
    db = json.load(f)

# 프로젝트 DataFrame
rows = []
for p in db['projects']:
    rows.append({
        'id': p['id'],
        'name': p['project_name'],
        'department': p['department'],
        'field': p['field'],
        'account_type': p['account_type'],
        'status': p['status'],
        'is_rnd': p['is_rnd'],
        'budget_2024': p['budget'].get('2024_settlement'),
        'budget_2025': p['budget'].get('2025_original'),
        'budget_2026': p['budget']['2026_budget'],
        'change_rate': p['budget'].get('change_rate'),
        'sub_count': len(p.get('sub_projects', [])),
        'domains': ', '.join(p.get('ai_domains', [])),
    })

df = pd.DataFrame(rows)

# 부처별 예산 피벗
pivot = df.pivot_table(
    values='budget_2026', index='department',
    aggfunc=['sum', 'count', 'mean']
).sort_values(('sum', 'budget_2026'), ascending=False)

# R&D vs 비R&D 비교
rnd_stats = df.groupby('is_rnd')['budget_2026'].agg(['sum', 'count', 'mean'])

# 내역사업 DataFrame
sub_rows = []
for p in db['projects']:
    for s in p.get('sub_projects', []):
        sub_rows.append({
            'parent_id': p['id'],
            'parent_name': p['project_name'],
            'department': p['department'],
            'sub_name': s['name'],
            'budget_2024': s.get('budget_2024'),
            'budget_2025': s.get('budget_2025'),
            'budget_2026': s.get('budget_2026'),
        })
sub_df = pd.DataFrame(sub_rows)
```

### 5.3 JavaScript에서 활용 (웹 앱)

```javascript
// 데이터 로드
const response = await fetch('data/budget_db.json');
const db = await response.json();

// 부처별 예산 집계
const deptBudget = {};
db.projects.forEach(p => {
  deptBudget[p.department] = (deptBudget[p.department] || 0) + p.budget['2026_budget'];
});

// 키워드 검색
function searchProjects(keyword) {
  return db.projects.filter(p => {
    const text = [p.project_name, p.purpose, p.description, p.department]
      .filter(Boolean).join(' ');
    return text.includes(keyword);
  });
}

// 유사도 네트워크에서 특정 사업의 유사 사업 찾기 (source/target은 프로젝트 id)
function findSimilar(projectId, minScore = 0.5) {
  return db.analysis.duplicate_network.filter(pair =>
    (pair.source === projectId || pair.target === projectId)
    && pair.combined >= minScore
  );
}
```

### 5.4 Excel/CSV 변환

```python
import json, csv

with open('output/data/budget_db.json', encoding='utf-8') as f:
    db = json.load(f)

# 사업 목록 CSV
with open('projects.csv', 'w', encoding='utf-8-sig', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['ID', '사업명', '부처', '분야', '회계유형', '상태',
                     'R&D', '2024결산', '2025본예산', '2026본예산',
                     '증감액', '증감률', '내역사업수', 'AI도메인'])
    for p in db['projects']:
        writer.writerow([
            p['id'], p['project_name'], p['department'], p['field'],
            p['account_type'], p['status'], p['is_rnd'],
            p['budget'].get('2024_settlement', ''),
            p['budget'].get('2025_original', ''),
            p['budget']['2026_budget'],
            p['budget'].get('change_amount', ''),
            p['budget'].get('change_rate', ''),
            len(p.get('sub_projects', [])),
            ', '.join(p.get('ai_domains', []))
        ])

# 내역사업 CSV
with open('sub_projects.csv', 'w', encoding='utf-8-sig', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['상위사업ID', '상위사업명', '부처', '내역사업명',
                     '2024', '2025', '2026'])
    for p in db['projects']:
        for s in p.get('sub_projects', []):
            writer.writerow([
                p['id'], p['project_name'], p['department'], s['name'],
                s.get('budget_2024', ''), s.get('budget_2025', ''),
                s.get('budget_2026', '')
            ])
```

---

## 6. 예산서 Markdown 파일

### 6.1 생성 방법

대시보드(output/index.html)의 헤더 메뉴에서 **문서 > 예산서 Markdown** 클릭 시 `2026_AI_재정사업_전체_YYYYMMDD.md` 파일이 다운로드된다.

### 6.2 Markdown 파일 구조

문서는 **Part 1 (총괄 분석)**과 **Part 2 (전체 사업 상세)**로 구성되며, JSON 데이터의 모든 필드를 포함한다.

```markdown
# 2026년 AI 재정사업 전체 분석 보고서

## 1. 총괄 요약
| 항목 | 값 |
|------|-----|
| 총 사업 수 | 533개 |
| R&D 사업 | 288개 |
| 정보화 사업 | 68개 |
| 신규 사업 | 6개 |
| 2024 결산 합계 | ... 백만원 |
| 2025 본예산 합계 | ... 백만원 |
| 2026 확정예산 합계 | ... 백만원 |
| 전년 대비 증감 | ... 백만원 (X.X%) |

## 2. 유형별 예산 집계
| 유형 | 사업 수 | 2026 예산(백만원) | 비중(%) |
(R&D, 정보화, 일반)

## 3. 부처별 예산 현황
| 순위 | 부처명 | 사업수 | R&D | 정보화 | 2024결산 | 2025본예산 | 2026확정 | 증감액 | 증감률(%) | 평균예산 |
(41개 부처 전체, analysis.by_department의 모든 필드)

## 4. AI 도메인별 예산 집계
| 도메인 | 사업 수 | 2026 예산(백만원) | 비중(%) |
(27개 도메인, analysis.by_domain 전체)

## 5. 예산 증가 TOP 20
## 6. 예산 감소 TOP 20
(analysis.top_increases/top_decreases)

## 7. 중복 의심 사업 그룹 (97개)
### 7.1. 그룹명
- 사업 수, 총 예산, 관련 부처, 등급
- Jaccard/TF-IDF/LSA 유사도
| 부처 | 사업명 | 2026 예산(백만원) |

## 8. 키워드 클러스터 (16개)
### 8.1. 클라우드
- 사업 수, 부처 수, 총 예산, 관련 부처
| 부처 | 사업명 | 2026 예산(백만원) |

## 9. 동일 시행기관 다부처 사업 (17개)
(analysis.same_agency 전체)

## 10. 유사도 네트워크 상위 50쌍
| 순위 | 사업 A | 사업 B | Jaccard | TF-IDF | LSA | 종합 | 등급 |

---

# 전체 사업 상세 (533개)

## 감사원

### 전산운영경비(정보화)

#### 기본 정보
| 항목 | 내용 |
|------|------|
| ID | 1 |
| 사업코드 | 1134-309 |
| 부처 | 감사원 |
| 소관부서 | 디지털감사국, 적극행정공공, 감사지원관 |
| 회계유형 | 일반회계 |
| 분야 | 일반·지방행정 |
| 부문 | 일반행정 |
| 프로그램 | [1100] 감사활동 및 행정지원 |
| 단위사업 | [1134] 전산운영경비 |
| 세부사업 | [309] 전산운영경비(정보화) |
| 상태 | 신규 |
| 시행기관 | 감사원 |
| R&D 여부 | 아니오 |
| 정보화 여부 | 예 |
| PDF 페이지 | 20~29 |

#### AI 분류
- **AI 도메인**: 보안/사이버, 통신/네트워크
- **AI 기술유형**: (해당 시)
- **R&D 단계**: (해당 시)
- **키워드**: 전산운영경비

#### 예산 (백만원)
| 2024 결산 | 2025 본예산 | 2025 추경 | 2026 요구 | 2026 확정 | 증감액 | 증감률(%) |
|-----------|------------|-----------|-----------|----------|--------|-----------|
| 12,508 | 16,111 | 16,111 | 14,762 | 10,300 | -5,811 | -36.1 |

#### 내역사업 (4건, 합계: 10,300 백만원)
| 내역사업명 | 2024(백만원) | 2025(백만원) | 2026(백만원) |
| 감사자료분석시스템 구축·운영 | 1,811 | 1,781 | 2,086 |
| OASYS 구축·운영 | 12,822 | 12,854 | 6,504 |
| ...

#### 사업관리자 (4건)
| 내역사업 | 소관부서 | 시행기관 |

#### 사업목적
(전문)

#### 사업내용
(purpose와 다른 경우만 별도 출력)

#### 법적근거
(전문)

#### 유사 사업 (상위 10건)
| 유사 사업 | 부처 | 종합유사도 | Jaccard | TF-IDF | LSA | 등급 |
(duplicate_network에서 해당 사업과 유사도 30%+ 쌍)

---

## 부록: 데이터 메타정보
| 항목 | 값 |
(metadata 전체 필드)
```

### 6.3 Markdown 활용 방법

#### LLM 분석 입력

```python
# Markdown 파일을 LLM에 전달하여 분석 요청
with open('ai_budget_2026.md', encoding='utf-8') as f:
    md_content = f.read()

# 특정 부처 섹션만 추출
import re
dept_section = re.findall(
    r'### \[과학기술정보통신부\].*?(?=### \[|$)',
    md_content, re.DOTALL
)
```

#### 문서 변환

```bash
# Markdown → HTML
pandoc ai_budget_2026.md -o budget_report.html --standalone

# Markdown → PDF (한글 폰트 필요)
pandoc ai_budget_2026.md -o budget_report.pdf \
  --pdf-engine=xelatex \
  -V mainfont="Pretendard" \
  -V geometry:margin=2cm

# Markdown → DOCX (Word)
pandoc ai_budget_2026.md -o budget_report.docx
```

#### 버전 관리 및 비교

```bash
# Git으로 연도별 Markdown 비교
git diff ai_budget_2025.md ai_budget_2026.md

# 특정 부처의 예산 변동 추적
diff <(grep -A5 "과학기술정보통신부" 2025.md) \
     <(grep -A5 "과학기술정보통신부" 2026.md)
```

---

## 7. 유사성 검색 Markdown

### 7.1 생성 방법

대시보드의 **유사성 분석 > 키워드 유사성 검색** 탭에서 검색 실행 후 **Markdown 내려받기** 클릭.

### 7.2 구조

```markdown
# 유사성 검색 결과

## 검색 조건
- 검색어: "클라우드 데이터센터"
- 알고리즘: Jaccard+Cosine
- 내역사업 레벨: 아니오
- 검색 일시: 2026-03-08

## 검색 결과
- 매칭 사업: 28건
- 유사 쌍: 45건 (30%+ 유사도)

## 상위 50 유사 쌍
| 순위 | 사업 A | 사업 B | 유사도 | 등급 |
|------|--------|--------|--------|------|
| 1 | 과기부_클라우드... | 행안부_클라우드... | 78% | 고유사 |
| ...

## 유사 사업 그룹 (Union-Find)
### 그룹 1 (5개 사업)
- 과기부_클라우드 컴퓨팅...
- 행안부_정부 클라우드...
- ...
```

---

## 8. 주의사항

### 8.1 데이터 한계

| 항목 | 설명 |
|------|------|
| 예산 단위 | 모든 금액은 **백만원** 단위 |
| 내역사업 커버리지 | 474/533 사업에만 내역사업 데이터 존재 (88.9%) |
| 예산 불일치 | 내역사업 합계 ≠ 총예산 불일치 건수 (metadata의 `budget_mismatch_count` 참조, 보정 후 0건) |
| AI 도메인 | 키워드 기반 자동 분류 (수동 검증 미완료) |
| 사업목적/내용 | PDF 추출 특성상 테이블 데이터가 텍스트에 혼입된 경우 있음 |
| null 값 | 신규 사업의 2024/2025 예산은 null |

### 8.2 데이터 갱신

```bash
# PDF 재추출 (원본 변경 시)
python3 scripts/extract_pdf.py

# 분석 DB 재생성 (추출 후 필수)
python3 scripts/build_db.py

# 대시보드에 반영 (build_db.py가 자동으로 output/data/에 복사)
```

### 8.3 예산 용어 및 분석 시 주의사항

| 용어 | 설명 | 데이터 필드 |
|------|------|------------|
| **본예산** (당초예산) | 정기국회에서 의결된 최초 예산 | `2025_original` |
| **추경** (추가경정예산) | 국가재정법 제89조에 따라 편성된 수정예산. 추경 미편성 시 본예산과 동일 | `2025_supplementary` |
| **결산** | 회계연도 종료 후 실제 수입·지출 실적을 확정한 금액 | `2024_settlement` |
| **요구안** | 각 부처가 기재부에 제출한 예산 요구 금액. 확정예산과 차이가 클수록 기재부 사정에서 조정된 것 | `2026_request` |
| **확정예산** | 국회 의결을 거쳐 확정된 세출예산 | `2026_budget` |
| **증감률** | 전년도 본예산 대비 당해 확정예산의 변동률. 추경이 아닌 본예산 대비임에 유의 | `change_rate` |
| **순증/순감** | 전년도 본예산이 0인 사업(신규)의 증감률. 수치로 표현 불가하여 별도 텍스트 처리 | 증감률이 null인 경우 |

**분석 시 주의점**:
- 증감률은 본예산(original) 기준이므로, 추경이 편성된 사업의 경우 실질적인 전년 대비 변동과 차이가 있을 수 있다
- `2024_settlement`는 결산액이므로, 예산 대비 집행률 = 결산/예산 비율로 추정할 수 있으나, 이월·불용 등 상세 내역은 기능별 테이블에서만 확인 가능하다
- 부처별 예산 비교 시 회계유형(일반회계/특별회계/기금)에 따라 재원 성격이 다르므로, 단순 합산 비교에 주의해야 한다

### 8.4 인코딩

- 모든 JSON 파일: UTF-8 (BOM 없음)
- CSV 내보내기: UTF-8 (BOM 포함, Excel 호환)
- 한글 사업명의 특수문자: `ㆍ`(U+318D), `·`(U+00B7) 등 혼재 가능
