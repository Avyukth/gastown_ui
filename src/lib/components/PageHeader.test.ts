/**
 * PageHeader Component Tests
 *
 * Tests for breadcrumbs, titles, live counts, and actions.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import PageHeader from './PageHeader.svelte';

describe('PageHeader', () => {
	describe('Title', () => {
		it('renders title as h1', () => {
			render(PageHeader, { props: { title: 'Test Page' } });
			const heading = screen.getByRole('heading', { level: 1 });
			expect(heading).toHaveTextContent('Test Page');
		});

		it('applies font-display class to title', () => {
			render(PageHeader, { props: { title: 'Test Page' } });
			const heading = screen.getByRole('heading', { level: 1 });
			expect(heading).toHaveClass('font-display');
		});

		it('applies text-2xl class to title', () => {
			render(PageHeader, { props: { title: 'Test Page' } });
			const heading = screen.getByRole('heading', { level: 1 });
			expect(heading).toHaveClass('text-2xl');
		});
	});

	describe('Breadcrumbs', () => {
		it('renders breadcrumb navigation', () => {
			render(PageHeader, {
				props: {
					title: 'Test',
					breadcrumbs: [{ label: 'Home' }, { label: 'Page' }]
				}
			});
			expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
		});

		it('renders all breadcrumb items', () => {
			render(PageHeader, {
				props: {
					title: 'Test',
					breadcrumbs: [
						{ label: 'Home', href: '/' },
						{ label: 'Section', href: '/section' },
						{ label: 'Current' }
					]
				}
			});
			expect(screen.getByText('Home')).toBeInTheDocument();
			expect(screen.getByText('Section')).toBeInTheDocument();
			expect(screen.getByText('Current')).toBeInTheDocument();
		});

		it('renders links for breadcrumb items with href (except last)', () => {
			render(PageHeader, {
				props: {
					title: 'Test',
					breadcrumbs: [
						{ label: 'Home', href: '/' },
						{ label: 'Current' }
					]
				}
			});
			const homeLink = screen.getByRole('link', { name: 'Home' });
			expect(homeLink).toHaveAttribute('href', '/');
		});

		it('does not render navigation when no breadcrumbs', () => {
			render(PageHeader, { props: { title: 'Test' } });
			expect(screen.queryByRole('navigation', { name: 'Breadcrumb' })).not.toBeInTheDocument();
		});
	});

	describe('Subtitle', () => {
		it('renders simple subtitle', () => {
			render(PageHeader, {
				props: {
					title: 'Test',
					subtitle: 'A simple description'
				}
			});
			expect(screen.getByText('A simple description')).toBeInTheDocument();
		});
	});

	describe('Live Counts', () => {
		it('renders single live count', () => {
			render(PageHeader, {
				props: {
					title: 'Test',
					liveCount: { count: 5, label: 'active' }
				}
			});
			expect(screen.getByText('5')).toBeInTheDocument();
			expect(screen.getByText('active')).toBeInTheDocument();
		});

		it('renders multiple live counts', () => {
			render(PageHeader, {
				props: {
					title: 'Test',
					liveCounts: [
						{ count: 3, label: 'running', status: 'success' },
						{ count: 2, label: 'pending', status: 'warning' }
					]
				}
			});
			expect(screen.getByText('3')).toBeInTheDocument();
			expect(screen.getByText('running')).toBeInTheDocument();
			expect(screen.getByText('2')).toBeInTheDocument();
			expect(screen.getByText('pending')).toBeInTheDocument();
		});

		it('renders status dot for live count with status', () => {
			render(PageHeader, {
				props: {
					title: 'Test',
					liveCount: { count: 5, label: 'active', status: 'success' }
				}
			});
			// Status dot should exist (hidden from a11y)
			const container = screen.getByRole('banner');
			const statusDot = container.querySelector('.bg-success');
			expect(statusDot).toBeInTheDocument();
		});
	});

	describe('Sticky Behavior', () => {
		it('is sticky by default', () => {
			render(PageHeader, { props: { title: 'Test' } });
			const header = screen.getByRole('banner');
			expect(header).toHaveClass('sticky');
		});

		it('can disable sticky behavior', () => {
			render(PageHeader, { props: { title: 'Test', sticky: false } });
			const header = screen.getByRole('banner');
			expect(header).not.toHaveClass('sticky');
		});
	});

	describe('Bottom Border', () => {
		it('renders gradient bottom border', () => {
			render(PageHeader, { props: { title: 'Test' } });
			const header = screen.getByRole('banner');
			const border = header.querySelector('.bg-gradient-to-r');
			expect(border).toBeInTheDocument();
		});
	});

	describe('Custom Classes', () => {
		it('accepts custom class names', () => {
			render(PageHeader, { props: { title: 'Test', class: 'my-custom-class' } });
			const header = screen.getByRole('banner');
			expect(header).toHaveClass('my-custom-class');
		});
	});

	describe('Accessibility', () => {
		it('has banner role (header element)', () => {
			render(PageHeader, { props: { title: 'Test' } });
			expect(screen.getByRole('banner')).toBeInTheDocument();
		});

		it('breadcrumb separators are hidden from screen readers', () => {
			render(PageHeader, {
				props: {
					title: 'Test',
					breadcrumbs: [{ label: 'Home' }, { label: 'Page' }]
				}
			});
			const container = screen.getByRole('navigation', { name: 'Breadcrumb' });
			const hiddenElements = container.querySelectorAll('[aria-hidden="true"]');
			expect(hiddenElements.length).toBeGreaterThan(0);
		});
	});
});
