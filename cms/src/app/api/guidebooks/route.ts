import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export interface GuidebookMaterial {
  id: string;
  title: string;
  category: string;
  description: string;
  fileUrl: string;
  fileSize: string;
  fileType: string;
  isActive: boolean;
  downloadCount: number;
  updatedAt: string;
}

const DATA_DIR = path.join(process.cwd(), 'tmp_data');
const DATA_FILE = path.join(DATA_DIR, 'guidebook_materials.json');

declare global {
  var __guidebookMaterialsStore: GuidebookMaterial[] | undefined;
}

const DEFAULT_MATERIALS: GuidebookMaterial[] = [
  {
    id: 'mat-1',
    title: 'ISO/IEC 42001 · 27001 실무 가이드북',
    category: '가이드북',
    description: 'AI 경영시스템(AIMS) 및 정보보안 관리체계 동시 구축을 위한 핵심 가이드라인 및 통제항목 해설',
    fileUrl: '/assets/docs/ISO42001_27001_Practical_Guidebook_Quanternity.pdf',
    fileSize: '4.2 MB',
    fileType: 'PDF',
    isActive: true,
    downloadCount: 142,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mat-2',
    title: '인증 취득 단계별 준비 로드맵',
    category: '로드맵',
    description: '사전 진단부터 1·2단계 본심사, 사후관리까지 8~16주 표준 추진 일정표 및 단계별 산출물 목록',
    fileUrl: '/assets/docs/ISO_Certification_Roadmap_Quanternity.pdf',
    fileSize: '2.8 MB',
    fileType: 'PDF',
    isActive: true,
    downloadCount: 128,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'mat-3',
    title: 'AI 기본법 시행령 대응 체크리스트',
    category: '체크리스트',
    description: '2026년 AI기본법 하위법령에 따른 고영향 AI 사업자 위험관리계획 및 신뢰성 확보 의무 점검표',
    fileUrl: '/assets/docs/AI_Basic_Act_Compliance_Checklist_Quanternity.pdf',
    fileSize: '1.9 MB',
    fileType: 'PDF',
    isActive: true,
    downloadCount: 185,
    updatedAt: new Date().toISOString(),
  }
];

function getMaterialsStore(): GuidebookMaterial[] {
  if (!globalThis.__guidebookMaterialsStore) {
    let fileMaterials: GuidebookMaterial[] = [];
    try {
      if (fs.existsSync(DATA_FILE)) {
        const data = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          fileMaterials = parsed;
        }
      }
    } catch (e) {
      // Ephemeral storage fallback
    }
    globalThis.__guidebookMaterialsStore = fileMaterials.length > 0 ? fileMaterials : [...DEFAULT_MATERIALS];
  }
  return globalThis.__guidebookMaterialsStore;
}

function saveMaterialsStore(materials: GuidebookMaterial[]) {
  globalThis.__guidebookMaterialsStore = materials;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(materials, null, 2), 'utf-8');
  } catch (e) {
    // Read-only filesystem handling
  }
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

export async function GET() {
  const materials = getMaterialsStore();
  return NextResponse.json({ success: true, materials }, { headers: corsHeaders() });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const store = getMaterialsStore();

    if (body.action === 'toggle_active' && body.id) {
      const item = store.find((m) => m.id === body.id);
      if (item) {
        item.isActive = !item.isActive;
        item.updatedAt = new Date().toISOString();
        saveMaterialsStore([...store]);
        return NextResponse.json({ success: true, material: item }, { headers: corsHeaders() });
      }
      return NextResponse.json({ success: false, error: '자료를 찾을 수 없습니다.' }, { headers: corsHeaders(), status: 404 });
    }

    if (body.action === 'delete' && body.id) {
      const filtered = store.filter((m) => m.id !== body.id);
      saveMaterialsStore(filtered);
      return NextResponse.json({ success: true, message: '자료가 삭제되었습니다.' }, { headers: corsHeaders() });
    }

    // Create or Update
    const title = String(body.title || '').trim();
    if (!title) {
      return NextResponse.json({ success: false, error: '자료명을 입력해주세요.' }, { headers: corsHeaders(), status: 400 });
    }

    let existing = body.id ? store.find((m) => m.id === body.id) : null;

    if (existing) {
      existing.title = title;
      existing.category = body.category || existing.category || '가이드북';
      existing.description = body.description || existing.description || '';
      existing.fileUrl = body.fileUrl || existing.fileUrl;
      existing.fileSize = body.fileSize || existing.fileSize || '1.0 MB';
      existing.fileType = body.fileType || 'PDF';
      existing.isActive = body.isActive !== undefined ? body.isActive : existing.isActive;
      existing.updatedAt = new Date().toISOString();
    } else {
      const newMat: GuidebookMaterial = {
        id: 'mat-' + Date.now(),
        title,
        category: body.category || '가이드북',
        description: body.description || '',
        fileUrl: body.fileUrl || '#',
        fileSize: body.fileSize || '2.0 MB',
        fileType: body.fileType || 'PDF',
        isActive: body.isActive !== undefined ? body.isActive : true,
        downloadCount: 0,
        updatedAt: new Date().toISOString(),
      };
      store.unshift(newMat);
    }

    saveMaterialsStore([...store]);

    return NextResponse.json({ success: true, materials: store }, { headers: corsHeaders() });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { headers: corsHeaders(), status: 500 });
  }
}
