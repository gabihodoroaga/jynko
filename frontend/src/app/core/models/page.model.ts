export interface PageCollection {
  id: string;
  project_id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Page {
  id: string;
  project_id: string;
  collection_id?: string;
  parent_page_id?: string;
  title: string;
  content: string;
  order: number;
  is_locked: boolean;
  label_ids: string[];
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

export interface PageVersion {
  id: string;
  page_id: string;
  title: string;
  content: string;
  created_by: string;
  created_at: string;
}

export interface PageTreeNode {
  page: Page;
  children: PageTreeNode[];
  expanded: boolean;
}
