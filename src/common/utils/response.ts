export function createSuccessResponse(message: string, data: any) {
    return {
        success: true,
        error: null,
        data,
    }
}