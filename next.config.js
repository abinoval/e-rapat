/** @type {import('next').NextConfig} */
const path = require('path');
const loaderUtils = require('loader-utils');

const hashOnlyIdent = (context, _, exportName) =>
	loaderUtils
		.getHashDigest(
			Buffer.from(
				`filePath:${path
					.relative(context.rootContext, context.resourcePath)
					.replace(/\\+/g, '/')}#className:${exportName}`,
			),
			'md4',
			'base64',
			6,
		)
		.replace(/^(-?\d|--)/, '_$1')

const nextConfig = {
	// reactStrictMode: true,
	// swcMinify: true,
	webpack(config, { dev }) {
		const rules = config.module.rules
			.find((rule) => typeof rule.oneOf === 'object')
			.oneOf.filter((rule) => Array.isArray(rule.use))

		if (!dev)
			rules.forEach((rule) => {
				rule.use.forEach((moduleLoader) => {
					if (
						moduleLoader.loader?.includes('css-loader') &&
						!moduleLoader.loader?.includes('postcss-loader')
					)
						moduleLoader.options.modules.getLocalIdent = hashOnlyIdent

					// earlier below statements were sufficient:
					// delete moduleLoader.options.modules.getLocalIdent;
					// moduleLoader.options.modules.localIdentName = '[hash:base64:6]';
				})
			})

		return config
	},
}

module.exports = nextConfig
