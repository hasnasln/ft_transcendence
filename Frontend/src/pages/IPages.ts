export interface IPages
{
	render(container: HTMLElement): void ;
	destroy?(): void ;
	init?(): void ;
	getTitle?(): string ;
	getPath?(): string ;
}
