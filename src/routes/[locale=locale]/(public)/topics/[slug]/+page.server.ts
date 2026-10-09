import { error, redirect } from '@sveltejs/kit';
import { breadcrumbLd } from '#lib/json-ld.ts';
import { buildSeo } from '#lib/seo.ts';
import { getT, loadMessages } from '#lib/server/i18n.ts';
import { getTopic } from '#lib/server/public-api.ts';
import { getTopicModulePage } from '#lib/server/topic-pages.ts';
import { isTopicModuleKey, previewEntries, TOPIC_MODULES, topicHref, topicModules } from '#lib/topics.ts';
import type { PageServerLoad } from './$types';

const GUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const load: PageServerLoad = async ({ params, url }) => {
	const { locale, slug } = params;
	const topic = await getTopic(slug);
	if (!topic) error(404, 'Not found');

	// Links by category id (e.g. from a content page) settle on the readable slug URL.
	if (GUID.test(slug) && topic.slug) redirect(307, `/${locale}${topicHref(topic)}${url.search}`);

	const type = url.searchParams.get('type') ?? undefined;
	const modules = topicModules(topic.counts);
	// One module: nothing to switch between, so show its list directly.
	const active = (isTopicModuleKey(type) && modules.find((m) => m.key === type)) || (modules.length === 1 ? modules[0] : null);
	const page = Math.max(1, Number.parseInt(url.searchParams.get('page') ?? '1', 10) || 1);
	const list = active ? await getTopicModulePage(active.key, topic.id, page) : null;

	const t = getT(locale, 'TopicsPage');
	const path = `/topics/${slug}`;
	return {
		topic: { id: topic.id, slug: topic.slug, title: topic.title, description: topic.description, total: topic.total, counts: topic.counts },
		modules,
		activeKey: active?.key ?? null,
		previews: Object.fromEntries(TOPIC_MODULES.map((m) => [m.key, previewEntries(topic, m.key)])),
		list,
		page,
		msgs: loadMessages(locale, 'TopicsPage'),
		seo: buildSeo({
			locale,
			title: topic.title,
			description: topic.description ?? t('metaDescription'),
			path,
			type: 'website',
			jsonLd: [
				breadcrumbLd(locale, getT(locale, 'Metadata')('title'), [
					{ name: getT(locale, 'Nav')('topics'), path: '/topics' },
					{ name: topic.title, path }
				])
			]
		})
	};
};
