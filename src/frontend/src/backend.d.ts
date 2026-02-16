import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type TagId = bigint;
export interface Tag {
    id: TagId;
    name: string;
    color: string;
}
export interface GraphNode {
    id: DocumentId;
    title: string;
}
export interface GraphData {
    edges: Array<GraphEdge>;
    nodes: Array<GraphNode>;
}
export interface BacklinkRef {
    id: DocumentId;
    title: string;
}
export interface DocumentVersion {
    title: string;
    content: string;
    savedAt: bigint;
}
export interface GraphEdge {
    source: DocumentId;
    target: DocumentId;
}
export type DocumentId = bigint;
export interface Document {
    id: DocumentId;
    title: string;
    content: string;
    createdAt: bigint;
    tagIds: Array<TagId>;
    updatedAt: bigint;
}
export interface UserProfile {
    name: string;
}
export interface backendInterface {
    createDocument(title: string): Promise<Document>;
    createTag(name: string, color: string): Promise<Tag>;
    deleteDocument(id: DocumentId): Promise<void>;
    deleteTag(id: TagId): Promise<void>;
    getAllTags(): Promise<Array<Tag>>;
    getBacklinks(id: DocumentId): Promise<Array<BacklinkRef>>;
    getDocument(id: DocumentId): Promise<Document | null>;
    getDocumentByTitle(title: string): Promise<Document | null>;
    getDocuments(searchQuery: string, filterTagIds: Array<TagId>, sortBy: string): Promise<Array<Document>>;
    getGraphData(): Promise<GraphData>;
    getProfile(): Promise<UserProfile | null>;
    getVersions(id: DocumentId): Promise<Array<DocumentVersion>>;
    restoreVersion(id: DocumentId, versionIndex: bigint): Promise<Document>;
    saveVersion(id: DocumentId): Promise<void>;
    setProfile(name: string): Promise<void>;
    updateDocument(id: DocumentId, title: string, content: string, tagIds: Array<TagId>): Promise<Document>;
    updateTag(id: TagId, name: string, color: string): Promise<Tag>;
}
