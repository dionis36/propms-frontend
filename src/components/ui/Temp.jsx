  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Success Message */}
      {errors.success && (
        <div className="p-4 bg-success-100 border border-success-500 rounded-md">
          <div className="flex items-center">
            <Icon name="CheckCircle" size={20} className="text-success mr-3" />
            <p className="text-sm text-success">{errors.success}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errors.submit && (
        <div className="p-4 bg-error-100 border border-error-500 rounded-md">
          <div className="flex items-center">
            <Icon name="AlertCircle" size={20} className="text-error mr-3" />
            <p className="text-sm text-error">{errors.submit}</p>
          </div>
        </div>
      )}

      {/* Registration Fields */}
      {mode === 'register' && (
        <>
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-text-primary mb-2">
              First Name
            </label>
            <Input
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="Enter your first name"
              className={errors.firstName ? 'border-error-500 focus:ring-error-500' : ''}
              disabled={loading}
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-error">{errors.firstName}</p>
            )}
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-text-primary mb-2">
              Last Name
            </label>
            <Input
              id="lastName"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Enter your last name"
              className={errors.lastName ? 'border-error-500 focus:ring-error-500' : ''}
              disabled={loading}
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-error">{errors.lastName}</p>
            )}
          </div>

          {/* Phone Number Field */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-text-primary mb-2">
              Phone Number
            </label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handlePhoneChange(e, 'phone')}
              onKeyDown={(e) => handlePhoneKeyDown(e, 'phone')}
              onPaste={(e) => handlePhonePaste(e, 'phone')}
              placeholder="07XX XXX XXX"
              className={errors.phone ? 'border-error-500 focus:ring-error-500' : ''}
              disabled={loading}
              ref={phoneInputRef}
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-error">{errors.phone}</p>
            )}
          </div>

          {/* WhatsApp Number Field for Brokers */}
          {formData.role === 'broker' && (
            <div>
              <label htmlFor="whatsappNumber" className="block text-sm font-medium text-text-primary mb-2">
                WhatsApp Number
              </label>
              <Input
                id="whatsappNumber"
                name="whatsappNumber"
                type="tel"
                value={formData.whatsappNumber}
                onChange={(e) => handlePhoneChange(e, 'whatsappNumber')}
                onKeyDown={(e) => handlePhoneKeyDown(e, 'whatsappNumber')}
                onPaste={(e) => handlePhonePaste(e, 'whatsappNumber')}
                placeholder="07XX XXX XXX"
                className={errors.whatsappNumber ? 'border-error-500 focus:ring-error-500' : ''}
                disabled={loading}
                ref={whatsappInputRef}
              />
              {errors.whatsappNumber && (
                <p className="mt-1 text-sm text-error">{errors.whatsappNumber}</p>
              )}
            </div>
          )}
        </>
      )}

      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
          Email Address
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Enter your email"
          className={errors.email ? 'border-error-500 focus:ring-error-500' : ''}
          disabled={loading}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-error">{errors.email}</p>
        )}
      </div>

      {/* Password Field */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">
          Password
        </label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Enter your password"
            className={`pr-10 ${errors.password ? 'border-error-500 focus:ring-error-500' : ''}`}
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-secondary hover:text-text-primary"
            disabled={loading}
          >
            <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={20} />
          </button>
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-error">{errors.password}</p>
        )}
      </div>

      {/* Confirm the password field */}
      {mode === 'register' && (
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-primary mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm your password"
              className={`pr-10 ${errors.confirmPassword ? 'border-error-500 focus:ring-error-500' : ''}`}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-secondary hover:text-text-primary"
              disabled={loading}
            >
              <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={20} />
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-error">{errors.confirmPassword}</p>
          )}
        </div>
      )}
      {/* <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-primary mb-2">
          Confirm Password
        </label>
        <div className="relative">
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="Confirm your password"
            className={`pr-10 ${errors.confirmPassword ? 'border-error-500 focus:ring-error-500' : ''}`}
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-secondary hover:text-text-primary"
            disabled={loading}
          >
            <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={20} />
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-error">{errors.confirmPassword}</p>
        )}
      </div> */}
      {/* Confirm Password Field
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-primary mb-2">
          Confirm Password
        </label>
        <div className="relative">
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder="Confirm your password"
            className={`pr-10 ${errors.confirmPassword ? 'border-error-500 focus:ring-error-500' : ''}`}
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-secondary hover:text-text-primary"
            disabled={loading}
          >
            <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={20} />
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-error">{errors.confirmPassword}</p>
        )}
      </div> */}

      {/* Registration Role Selection */}
      {mode === 'register' && (
        <div>
          <label className="block text-sm font-medium text-text-primary mb-3">
            Account Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="relative flex cursor-pointer">
              <Input
                type="radio"
                name="role"
                value="tenant"
                checked={formData.role === 'tenant'}
                onChange={handleInputChange}
                className="sr-only"
                disabled={loading}
              />
              <div className={`flex-1 p-3 rounded-md border-2 text-center transition-all ${
                formData.role === 'tenant' ?'border-primary bg-primary-50 text-primary' :'border-border text-text-secondary hover:border-secondary-300'
              }`}>
                <Icon name="User" size={20} className="mx-auto mb-1" />
                <span className="text-sm font-medium">Tenant</span>
              </div>
            </label>
            <label className="relative flex cursor-pointer">
              <Input
                type="radio"
                name="role"
                value="broker"
                checked={formData.role === 'broker'}
                onChange={handleInputChange}
                className="sr-only"
                disabled={loading}
              />
              <div className={`flex-1 p-3 rounded-md border-2 text-center transition-all ${
                formData.role === 'broker' ?'border-primary bg-primary-50 text-primary' :'border-border text-text-secondary hover:border-secondary-300'
              }`}>
                <Icon name="Briefcase" size={20} className="mx-auto mb-1" />
                <span className="text-sm font-medium">Broker</span>
              </div>
            </label>
          </div>
        </div>
      )}
