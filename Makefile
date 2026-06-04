DOCS_CMS_DIR ?= docs-cms
DOCUCHANGO ?= docuchango
FLOWMARK ?= flowmark

# Force UTF-8 so docuchango's rich/emoji output does not crash on Windows consoles.
export PYTHONUTF8 := 1

.DEFAULT_GOAL := help

.PHONY: fmt fmt-docs help validate-docs validate-docs-cms validate-docs-cms-verbose validate-docs-cms-dry-run validate-markdown-links

fmt: fmt-docs

fmt-docs:
	@echo Formatting Markdown files...
	@$(FLOWMARK) --auto .
	@echo Formatting complete.

help:
	@echo Kaneer Make targets
	@echo.
	@echo Usage: make [target]
	@echo.
	@echo Targets:
	@echo   fmt                         Format all files
	@echo   fmt-docs                    Format Markdown via Flowmark auto mode
	@echo   help                        Show available targets
	@echo   validate-docs               Run all validations
	@echo   validate-docs-cms           Validate docs-cms via docuchango
	@echo   validate-docs-cms-verbose   Validate with verbose output
	@echo   validate-docs-cms-dry-run   Preview issues without modifying files
	@echo   validate-markdown-links     Validate Markdown links

validate-docs: validate-docs-cms validate-markdown-links

validate-docs-cms:
	@echo Validating docs-cms documents...
	@cd $(DOCS_CMS_DIR) && $(DOCUCHANGO) validate
	@echo Validation complete.

validate-docs-cms-verbose:
	@cd $(DOCS_CMS_DIR) && $(DOCUCHANGO) validate --verbose

validate-docs-cms-dry-run:
	@cd $(DOCS_CMS_DIR) && $(DOCUCHANGO) validate --dry-run

validate-markdown-links:
	@echo Validating Markdown links...
	@markdown-link-check -q --config markdown-link-check-config.json --ignore docs-cms/templates,.venv,docsite .
	@echo Link validation complete.
